import { ChevronDown } from "lucide-react";
import { FAQ } from "@/lib/chat-knowledge";

// Dùng chung bộ hỏi–đáp với chatbot (lib/chat-knowledge.ts) để nội dung luôn khớp nhau.
export function FaqSection() {
  return (
    <section id="hoi-dap" className="scroll-mt-24 bg-secondary/50 py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Hỏi đáp</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Những câu hỏi thường gặp
          </h2>
          <p className="mt-4 max-w-sm text-muted-foreground">
            Chưa thấy câu bạn cần? Hãy nhắn cho trợ lý ảo ở góc dưới bên phải màn hình, hoặc để lại email/số điện
            thoại trong form báo giá, đội ngũ sẽ liên hệ lại.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl bg-card px-5 shadow-sm shadow-primary/5 ring-1 ring-border open:ring-primary/30"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown className="size-5 shrink-0 text-primary duration-200 group-open:rotate-180" />
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
