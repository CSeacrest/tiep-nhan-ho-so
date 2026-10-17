import { after, type NextRequest } from "next/server";
import { buildSystemPrompt } from "@/lib/chat-knowledge";
import { UUID_RE, saveChatTurn } from "@/lib/chat-log";

// Chạy phía server: OPENAI_API_KEY không bao giờ được gửi xuống trình duyệt.
export const runtime = "nodejs";

const MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-5.6-luna";
// Giữ cả cuộc trò chuyện từ đầu. Chỉ khi quá dài mới bỏ bớt các tin CŨ NHẤT để không phình chi phí.
const MAX_HISTORY = 60; // số tin nhắn tối đa gửi kèm (30 lượt hỏi–đáp)
const MAX_TOTAL_CHARS = 20_000; // tổng độ dài lịch sử tối đa
const MAX_USER_CHARS = 500; // độ dài tối đa một tin của khách
const MAX_BOT_CHARS = 2_000; // độ dài tối đa một tin của bot (không cắt cụt câu trả lời cũ)
const RATE_LIMIT = 15; // số yêu cầu tối đa / IP / phút
const RATE_WINDOW_MS = 60_000;

// Giới hạn tần suất đơn giản trong bộ nhớ (đủ cho 1 instance; dùng Redis/Upstash khi chạy nhiều instance).
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > RATE_LIMIT;
}

type ChatMessage = { role: "user" | "assistant"; content: string };

function parseMessages(body: unknown): ChatMessage[] | null {
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw)) return null;

  let messages: ChatMessage[] = [];
  for (const m of raw.slice(-200)) {
    const role = (m as { role?: unknown })?.role;
    const content = (m as { content?: unknown })?.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim().slice(0, role === "user" ? MAX_USER_CHARS : MAX_BOT_CHARS);
    if (text) messages.push({ role, content: text });
  }
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") return null;

  // Quá dài thì bỏ tin cũ nhất trước (luôn giữ tin mới nhất của khách)
  messages = messages.slice(-MAX_HISTORY);
  let total = messages.reduce((n, m) => n + m.content.length, 0);
  while (total > MAX_TOTAL_CHARS && messages.length > 1) {
    total -= messages.shift()!.content.length;
  }
  return messages;
}

const fail = (status: number, error: string) => Response.json({ error }, { status });

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fail(500, "Chatbot chưa được cấu hình. Vui lòng thử lại sau.");

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return fail(429, "Bạn gửi hơi nhanh, vui lòng đợi một chút rồi hỏi tiếp nhé.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Yêu cầu không hợp lệ.");
  }
  const messages = parseMessages(body);
  if (!messages) return fail(400, "Yêu cầu không hợp lệ.");

  // ID ẩn danh của khách (theo trình duyệt) và ID cuộc hội thoại (theo lần mở trang) để lưu vào Supabase.
  // Thiếu hoặc sai định dạng thì vẫn trả lời bình thường, chỉ là không lưu.
  const ids = body as { visitorId?: unknown; conversationId?: unknown };
  const visitorId = typeof ids.visitorId === "string" && UUID_RE.test(ids.visitorId) ? ids.visitorId.toLowerCase() : null;
  const conversationId =
    typeof ids.conversationId === "string" && UUID_RE.test(ids.conversationId) ? ids.conversationId.toLowerCase() : null;
  const askedAt = new Date();

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        reasoning_effort: "low", // trả lời nhanh; model này không nhận tham số temperature
        max_completion_tokens: 600,
        messages: [{ role: "system", content: buildSystemPrompt() }, ...messages],
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      // Chỉ ghi mã lỗi ở server, không trả chi tiết (có thể lộ cấu hình) cho khách.
      const detail = await res.text().catch(() => "");
      console.error(`[chat] OpenAI ${res.status}:`, detail.slice(0, 300));
      return fail(502, "Xin lỗi, trợ lý đang bận. Bạn thử lại sau ít phút nhé.");
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string | null } }[] };
    const reply = data.choices?.[0]?.message?.content?.trim();
    if (!reply) return fail(502, "Xin lỗi, mình chưa trả lời được lúc này. Bạn thử lại nhé.");

    // Lưu hội thoại sau khi đã gửi câu trả lời, không làm chậm khách
    if (visitorId && conversationId) {
      const userText = messages[messages.length - 1].content;
      const userAgent = request.headers.get("user-agent");
      const repliedAt = new Date();
      after(() => saveChatTurn({ conversationId, visitorId, userText, reply, userAgent, askedAt, repliedAt }));
    }

    return Response.json({ reply });
  } catch (err) {
    console.error("[chat] lỗi gọi OpenAI:", err instanceof Error ? err.message : err);
    return fail(502, "Xin lỗi, trợ lý đang bận. Bạn thử lại sau ít phút nhé.");
  }
}
