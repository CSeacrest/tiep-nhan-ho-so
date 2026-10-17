import { createAdminClient } from "@supabase/server/core";

// Ghi hội thoại chatbot vào Supabase (bảng tạo bởi supabase/schema.sql).
// Chạy ở server bằng khoá secret (bỏ qua RLS). Mọi lỗi chỉ được ghi log, KHÔNG làm hỏng việc trả lời khách.

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ChatTurn = {
  conversationId: string;
  visitorId: string;
  userText: string;
  reply: string;
  userAgent?: string | null;
  askedAt: Date; // thời điểm khách gửi câu hỏi
};

let warnedMissingEnv = false;

export async function saveChatTurn(turn: ChatTurn): Promise<void> {
  try {
    const supabase = createAdminClient();

    // 1) Tạo cuộc hội thoại nếu chưa có (lần đầu của phiên); nếu đã có thì giữ nguyên.
    const created = await supabase
      .from("chat_conversations")
      .upsert(
        {
          id: turn.conversationId,
          visitor_id: turn.visitorId,
          user_agent: turn.userAgent?.slice(0, 300) ?? null,
        },
        { onConflict: "id", ignoreDuplicates: true },
      );
    if (created.error) throw created.error;

    // 2) Chặn ghi vào hội thoại của người khác: ID hội thoại phải thuộc đúng visitor này.
    const owner = await supabase
      .from("chat_conversations")
      .select("visitor_id")
      .eq("id", turn.conversationId)
      .maybeSingle();
    if (owner.error) throw owner.error;
    if (!owner.data || owner.data.visitor_id !== turn.visitorId.toLowerCase()) {
      console.warn("[chat-log] bỏ qua: conversationId không thuộc visitor này");
      return;
    }

    // 3) Lưu câu hỏi rồi câu trả lời (thứ tự theo created_at, trigger tự cập nhật số tin nhắn).
    const inserted = await supabase.from("chat_messages").insert([
      {
        conversation_id: turn.conversationId,
        visitor_id: turn.visitorId,
        role: "user",
        content: turn.userText,
        created_at: turn.askedAt.toISOString(),
      },
      {
        conversation_id: turn.conversationId,
        visitor_id: turn.visitorId,
        role: "assistant",
        content: turn.reply,
        created_at: new Date().toISOString(),
      },
    ]);
    if (inserted.error) throw inserted.error;
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    // Thiếu biến môi trường Supabase: chỉ cảnh báo một lần cho đỡ ồn log
    if (/SUPABASE_URL|SUPABASE_SECRET|EnvError|secret key/i.test(message)) {
      if (!warnedMissingEnv) {
        warnedMissingEnv = true;
        console.warn("[chat-log] chưa cấu hình SUPABASE_URL / SUPABASE_SECRET_KEY nên không lưu hội thoại:", message);
      }
      return;
    }
    console.error("[chat-log] lưu hội thoại thất bại:", message);
  }
}
