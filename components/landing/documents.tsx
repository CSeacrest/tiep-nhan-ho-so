import { FileText, IdCard, Languages, Info } from "lucide-react";

// Nội dung lấy từ bộ hỏi–đáp: 3 loại giấy tờ + lưu ý về IELTS.
const documents = [
  {
    icon: FileText,
    title: "Bảng điểm học tập",
    detail: "Định dạng PDF",
  },
  {
    icon: Languages,
    title: "Chứng chỉ IELTS",
    detail: "Ảnh chụp chứng chỉ",
  },
  {
    icon: IdCard,
    title: "CMND/CCCD hoặc hộ chiếu",
    detail: "Ảnh chụp giấy tờ",
  },
];

export function Documents() {
  return (
    <section id="giay-to" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Giấy tờ</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Chỉ cần chuẩn bị 3 loại giấy tờ
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Gọn nhẹ và dễ chuẩn bị. Bạn nộp trực tiếp trên cổng hồ sơ, hệ thống sẽ lo phần đối chiếu cho bạn.
          </p>

          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
            <Info className="mt-0.5 size-5 shrink-0 text-primary" />
            <p>
              Chưa có bằng IELTS? Bạn vẫn đăng ký được, chỉ cần bổ sung chứng chỉ IELTS trước khi nộp hồ sơ
              chính thức cho trường.
            </p>
          </div>
        </div>

        <ul className="grid gap-4 sm:grid-cols-3">
          {documents.map(({ icon: Icon, title, detail }, i) => (
            <li
              key={title}
              className="rounded-3xl bg-card p-6 text-center shadow-sm shadow-primary/5 ring-1 ring-border duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
            >
              <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-linear-to-br from-accent to-secondary text-primary ring-4 ring-background">
                <Icon className="size-7" />
              </span>
              <p className="mt-1 text-xs font-semibold text-primary/70">Giấy tờ {i + 1}</p>
              <h3 className="mt-2 font-semibold leading-snug">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
