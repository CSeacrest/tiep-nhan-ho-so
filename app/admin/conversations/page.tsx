import Link from "next/link";
import { createAdminClient } from "@supabase/server/core";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Luôn đọc dữ liệu mới nhất từ Supabase mỗi lần mở trang
export const dynamic = "force-dynamic";

type ChatMessage = { id: number; role: "user" | "assistant"; content: string; created_at: string };
type Conversation = {
  id: string;
  visitor_id: string;
  created_at: string;
  last_message_at: string;
  message_count: number;
  chat_messages: ChatMessage[];
};

const PAGE_LIMIT = 50;

// ID hiển thị gọn cho khách: 8 ký tự đầu của UUID, ví dụ KH-3F9A2C1D
const shortVisitor = (id: string) => `KH-${id.slice(0, 8).toUpperCase()}`;
const shortConversation = (id: string) => `#${id.slice(0, 8)}`;

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function loadConversations(visitor: string | null) {
  try {
    const supabase = createAdminClient();
    let query = supabase
      .from("chat_conversations")
      .select(
        "id, visitor_id, created_at, last_message_at, message_count, chat_messages(id, role, content, created_at)",
      )
      .order("last_message_at", { ascending: false })
      .limit(PAGE_LIMIT)
      .order("created_at", { referencedTable: "chat_messages", ascending: true })
      .order("id", { referencedTable: "chat_messages", ascending: true });
    if (visitor) query = query.eq("visitor_id", visitor);

    const { data, error } = await query;
    if (error) {
      const missingTable = error.code === "PGRST205" || error.code === "42P01";
      return { conversations: [] as Conversation[], problem: missingTable ? ("no-table" as const) : ("error" as const), detail: error.message };
    }
    return { conversations: (data ?? []) as unknown as Conversation[], problem: null, detail: "" };
  } catch (err) {
    return {
      conversations: [] as Conversation[],
      problem: "no-env" as const,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <p className="font-medium">{title}</p>
      <div className="mt-2 space-y-2 text-sm text-muted-foreground">{children}</div>
    </Card>
  );
}

export default async function AdminConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ visitor?: string }>;
}) {
  const { visitor: visitorParam } = await searchParams;
  const visitor = visitorParam && UUID_RE.test(visitorParam) ? visitorParam.toLowerCase() : null;

  const { conversations, problem, detail } = await loadConversations(visitor);

  const totalMessages = conversations.reduce((n, c) => n + c.chat_messages.length, 0);
  const totalVisitors = new Set(conversations.map((c) => c.visitor_id)).size;

  return (
    <>
      <AdminPageHeader
        title="Hội thoại"
        description="Câu hỏi và câu trả lời của khách với chatbot trên trang chủ, nhóm theo từng cuộc hội thoại và ID khách."
      />

      {problem === "no-env" && (
        <Notice title="Chưa kết nối Supabase">
          <p>
            Cần đặt <code>SUPABASE_URL</code> và <code>SUPABASE_SECRET_KEY</code> trong <code>.env.local</code> (khi chạy
            máy) hoặc trong Environment Variables của Vercel, rồi khởi động/deploy lại.
          </p>
          <p className="text-xs">{detail}</p>
        </Notice>
      )}

      {problem === "no-table" && (
        <Notice title="Chưa có bảng lưu hội thoại">
          <p>
            Mở Supabase Dashboard → SQL Editor, dán nội dung file <code>supabase/schema.sql</code> rồi bấm Run. Sau đó
            tải lại trang này.
          </p>
        </Notice>
      )}

      {problem === "error" && (
        <Notice title="Không đọc được dữ liệu">
          <p className="text-xs">{detail}</p>
        </Notice>
      )}

      {!problem && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Cuộc hội thoại", value: conversations.length },
              { label: "Khách (ID riêng)", value: totalVisitors },
              { label: "Tin nhắn", value: totalMessages },
            ].map((s) => (
              <Card key={s.label} className="p-5">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-primary">{s.value}</p>
              </Card>
            ))}
          </div>

          {visitor && (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-accent px-4 py-3 text-sm text-accent-foreground">
              <span>
                Đang xem riêng khách <strong>{shortVisitor(visitor)}</strong>
              </span>
              <Link href="/admin/conversations" className="font-medium underline underline-offset-4">
                Xem tất cả khách
              </Link>
            </div>
          )}

          {conversations.length === 0 ? (
            <Notice title="Chưa có cuộc hội thoại nào">
              <p>Khi khách chat trên trang chủ, từng cuộc hội thoại sẽ xuất hiện ở đây.</p>
            </Notice>
          ) : (
            <div className="space-y-4">
              {conversations.map((conv, index) => {
                const firstQuestion = conv.chat_messages.find((m) => m.role === "user")?.content ?? "(chưa có câu hỏi)";
                return (
                  <details
                    key={conv.id}
                    open={index < 3}
                    className="group overflow-hidden rounded-2xl bg-card ring-1 ring-border open:ring-primary/30"
                  >
                    <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 [&::-webkit-details-marker]:hidden">
                      <span className="rounded-full bg-primary px-3 py-1 font-mono text-xs font-semibold text-primary-foreground">
                        {shortVisitor(conv.visitor_id)}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{shortConversation(conv.id)}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{firstQuestion}</span>
                      <span className="text-xs text-muted-foreground">
                        {conv.chat_messages.length} tin · {formatTime(conv.last_message_at)}
                      </span>
                    </summary>

                    <div className="border-t bg-muted/40 px-5 py-4">
                      <dl className="grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
                        <div>
                          <dt className="inline font-medium text-foreground">ID khách: </dt>
                          <dd className="inline break-all font-mono">{conv.visitor_id}</dd>
                          {" · "}
                          <Link
                            href={`/admin/conversations?visitor=${conv.visitor_id}`}
                            className="font-medium text-primary underline underline-offset-4"
                          >
                            Lọc theo khách này
                          </Link>
                        </div>
                        <div>
                          <dt className="inline font-medium text-foreground">ID hội thoại: </dt>
                          <dd className="inline break-all font-mono">{conv.id}</dd>
                        </div>
                        <div>
                          <dt className="inline font-medium text-foreground">Bắt đầu: </dt>
                          <dd className="inline">{formatTime(conv.created_at)}</dd>
                        </div>
                      </dl>

                      <ol className="mt-4 space-y-3">
                        {conv.chat_messages.map((m) => (
                          <li key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                            <div className={cn("max-w-[85%]", m.role === "user" ? "items-end text-right" : "")}>
                              <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                                {m.role === "user" ? `Khách ${shortVisitor(conv.visitor_id)}` : "Chatbot"} ·{" "}
                                {formatTime(m.created_at)}
                              </p>
                              <div
                                className={cn(
                                  "whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-left text-sm",
                                  m.role === "user"
                                    ? "rounded-br-sm bg-primary text-primary-foreground"
                                    : "rounded-bl-sm bg-card ring-1 ring-border",
                                )}
                              >
                                {m.content}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </details>
                );
              })}
            </div>
          )}

          {conversations.length === PAGE_LIMIT && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Đang hiển thị {PAGE_LIMIT} cuộc hội thoại gần nhất.
            </p>
          )}
        </>
      )}
    </>
  );
}
