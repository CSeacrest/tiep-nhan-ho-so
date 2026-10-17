"use client";

import React from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  from: "bot" | "user";
  text: string;
  error?: boolean; // tin báo lỗi của hệ thống: hiển thị cho khách nhưng KHÔNG gửi lại cho AI
}

const quickQuestions = [
  "Dịch vụ này gồm những gì?",
  "Mất bao lâu để có kết quả?",
  "Chi phí dịch vụ là bao nhiêu?",
  "Cần chuẩn bị giấy tờ gì?",
];

const GREETING: Message = {
  from: "bot",
  text: "Chào bạn! Mình là trợ lý ảo của DuHoc24, bạn cần hỗ trợ gì về hồ sơ du học?",
};

const MAX_LENGTH = 500;

// Hội thoại lưu trong bộ nhớ của trang (biến cấp module, chỉ có ở trình duyệt):
// còn nguyên khi đóng/mở khung chat hoặc chuyển trang trong site, mất khi tải lại trang (F5).
const session: { messages: Message[]; open: boolean } = { messages: [GREETING], open: false };

export function ChatWidget() {
  const [open, setOpen] = React.useState(session.open);
  const [messages, setMessages] = React.useState<Message[]>(session.messages);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    session.messages = messages;
    session.open = open;
  }, [messages, open]);

  // Luôn cuộn xuống tin nhắn mới nhất
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, loading, open]);

  async function sendMessage(raw: string) {
    const text = raw.trim().slice(0, MAX_LENGTH);
    if (!text || loading) return;

    const next: Message[] = [...messages, { from: "user", text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      // Gửi TOÀN BỘ cuộc trò chuyện từ đầu (trừ lời chào mở đầu và tin báo lỗi) để bot nhớ mạch câu chuyện
      const history = next
        .slice(1)
        .filter((m) => !m.error)
        .map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };

      const ok = res.ok && !!data.reply;
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: ok ? data.reply! : (data.error ?? "Xin lỗi, có lỗi xảy ra. Bạn thử lại nhé."),
          error: !ok,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Không kết nối được. Bạn kiểm tra mạng rồi thử lại nhé.", error: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] max-h-[calc(100dvh-7.5rem)] w-80 flex-col overflow-hidden rounded-2xl border bg-card shadow-xl shadow-black/10 ring-1 ring-foreground/6.5 sm:w-96">
          <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
            <div>
              <p className="text-sm font-medium">Hỏi đáp nhanh</p>
              <p className="text-xs opacity-80">Trợ lý tư vấn du học</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Đóng khung chat"
              className="flex size-7 items-center justify-center rounded-full hover:bg-white/10"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex", m.from === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                    m.from === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground",
                  )}
                >
                  <span className="whitespace-pre-wrap">{m.text}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div
                  role="status"
                  aria-label="Trợ lý đang trả lời"
                  className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-3.5 py-3"
                >
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t p-3">
            <div className="flex flex-wrap gap-1.5 pb-2">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground duration-150 hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                maxLength={MAX_LENGTH}
                className="h-9 flex-1 rounded-full border border-input bg-transparent px-3.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <Button type="submit" size="icon" className="shrink-0" aria-label="Gửi" disabled={loading || !input.trim()}>
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Đóng khung chat" : "Mở khung chat hỏi đáp"}
        className="ml-auto flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-black/20 duration-150 hover:brightness-105 active:scale-95"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </div>
  );
}
