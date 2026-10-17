import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Check, Clock, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const trustPoints = [
  "Xem báo giá miễn phí",
  "Kết quả sơ bộ trong vài phút",
  "Hồ sơ được bảo mật",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-40">
      {/* Nền gradient ấm: các vệt sáng cam – hồng đào */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_55%_at_88%_8%,oklch(0.93_0.08_72/0.85),transparent_70%),radial-gradient(45%_50%_at_2%_85%,oklch(0.94_0.06_35/0.7),transparent_70%)]"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-3.5 py-1.5 text-sm font-medium text-accent-foreground shadow-sm">
            <GraduationCap className="size-4 text-primary" />
            Đồng hành cùng bạn từ chọn trường đến nộp hồ sơ
          </span>

          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.15] tracking-tight md:text-5xl lg:text-6xl">
            Tư vấn hồ sơ du học,{" "}
            <span className="text-primary">rõ ràng</span> từ báo giá đến xét duyệt
          </h1>

          <p className="mt-6 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
            Biết giá ngay khi điền form, nộp hồ sơ online và theo dõi hồ sơ của mình đạt hay
            chưa đạt điểm chuẩn từng trường. Nhẹ nhàng, minh bạch, không lo bỡ ngỡ.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="h-11 px-6 text-base shadow-md shadow-primary/25"
              nativeButton={false}
              render={<Link href="#bao-gia">Nhận báo giá ngay</Link>}
            />
            <Button
              variant="outline"
              size="lg"
              className="h-11 bg-card px-6 text-base"
              nativeButton={false}
              render={<Link href="/portal">Vào cổng hồ sơ</Link>}
            />
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {trustPoints.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="size-3.5" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div
            aria-hidden
            className="absolute -inset-4 -z-10 rotate-3 rounded-[2.5rem] bg-linear-to-br from-accent to-secondary"
          />
          <div className="overflow-hidden rounded-[2rem] shadow-2xl shadow-primary/15 ring-1 ring-primary/10">
            <Image
              src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop"
              alt="Sinh viên tung mũ tốt nghiệp sau khi hoàn tất chương trình du học"
              width={1600}
              height={1200}
              priority
              className="aspect-4/5 w-full object-cover sm:aspect-5/4 lg:aspect-4/5"
            />
          </div>

          <div className="animate-float-soft absolute -left-3 bottom-8 flex items-center gap-3 rounded-2xl bg-card p-3.5 pr-5 shadow-xl shadow-primary/10 ring-1 ring-border sm:-left-8">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Clock className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Kết quả sơ bộ</p>
              <p className="text-xs text-muted-foreground">Trong vài phút</p>
            </div>
          </div>

          <div className="absolute -right-2 top-8 flex items-center gap-3 rounded-2xl bg-card p-3.5 pr-5 shadow-xl shadow-primary/10 ring-1 ring-border sm:-right-6">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <BadgeCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Đối chiếu điểm chuẩn</p>
              <p className="text-xs text-muted-foreground">Tự động, minh bạch</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
