import { ClipboardList, FileUp, MailCheck, Scale, Trophy } from "lucide-react";

// Các bước lấy từ bộ hỏi–đáp: form báo giá → duyệt & email mời → nộp giấy tờ → đối chiếu → kết quả chính thức.
const steps = [
  {
    icon: ClipboardList,
    title: "Điền form báo giá",
    description: "Chọn quốc gia, bậc học, gói dịch vụ và để lại email, số điện thoại. Xem báo giá hoàn toàn miễn phí.",
  },
  {
    icon: MailCheck,
    title: "Đội ngũ duyệt yêu cầu",
    description: "Tư vấn viên xem xét yêu cầu của bạn, sau đó gửi email mời vào cổng hồ sơ.",
  },
  {
    icon: FileUp,
    title: "Nộp giấy tờ trên cổng",
    description: "Tải lên bảng điểm, ảnh chứng chỉ IELTS và ảnh CMND/CCCD hoặc hộ chiếu.",
  },
  {
    icon: Scale,
    title: "Đối chiếu điểm chuẩn",
    description: "Hệ thống tự so điểm học tập và IELTS với từng trường, báo kết quả sơ bộ trong vài phút.",
  },
  {
    icon: Trophy,
    title: "Nhận kết quả chính thức",
    description: "Kết quả chính thức từ trường thường mất 2–6 tuần, tuỳ từng trường.",
  },
];

export function HowItWorks() {
  return (
    <section id="quy-trinh" className="scroll-mt-24 bg-secondary/50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Quy trình</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            5 bước nhẹ nhàng để hoàn tất hồ sơ
          </h2>
          <p className="mt-4 text-muted-foreground">
            Mỗi bước đều rõ ràng, bạn luôn biết mình đang ở đâu và việc tiếp theo là gì.
          </p>
        </div>

        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map(({ icon: Icon, title, description }, i) => (
            <li
              key={title}
              className="relative rounded-3xl bg-card p-6 shadow-sm shadow-primary/5 ring-1 ring-border duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Icon className="size-6" />
                </span>
                <span className="text-4xl font-semibold text-primary/20">{i + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold leading-snug">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
