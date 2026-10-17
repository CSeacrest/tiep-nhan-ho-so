import Image from "next/image";
import { Clock, ShieldCheck, Sparkles } from "lucide-react";

const highlights = [
  {
    icon: Sparkles,
    title: "Báo giá tức thì",
    description: "Báo giá sẽ được gửi trực tiếp vào email đã đăng ký.",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=800&auto=format&fit=crop",
  },
  {
    icon: ShieldCheck,
    title: "Đối chiếu điểm chuẩn minh bạch",
    description:
      "Điểm học tập và IELTS của bạn được so trực tiếp với điểm chuẩn từng trường để biết kết quả đạt hay không.",
    image:
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?q=80&w=800&auto=format&fit=crop",
  },
  {
    icon: Clock,
    title: "Phản hồi trong 24h",
    description:
      "Gửi yêu cầu báo giá hoặc nộp hồ sơ xong, tư vấn viên sẽ liên hệ lại với bạn trong vòng 24 giờ.",
    image:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=800&auto=format&fit=crop",
  },
];

export function Highlights() {
  return (
    <section id="diem-noi-bat" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Vì sao chọn DuHoc24</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Đơn giản, minh bạch và luôn bên cạnh bạn
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description, image }) => (
            <div
              key={title}
              className="group overflow-hidden rounded-3xl bg-card shadow-sm shadow-primary/5 ring-1 ring-border duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={image}
                  alt={title}
                  width={800}
                  height={600}
                  className="aspect-4/3 w-full object-cover duration-500 group-hover:scale-105"
                />
                <span className="absolute bottom-3 left-3 flex size-11 items-center justify-center rounded-2xl bg-card text-primary shadow-md ring-1 ring-border">
                  <Icon className="size-5" />
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
