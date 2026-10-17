import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="pb-16 md:pb-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-primary to-[oklch(0.5_0.15_35)] px-8 py-14 text-center text-primary-foreground shadow-2xl shadow-primary/25 md:px-16 md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-10 size-72 rounded-full bg-white/10 blur-2xl"
          />

          <span className="relative mx-auto flex size-12 items-center justify-center rounded-2xl bg-white/15">
            <Heart className="size-6" />
          </span>
          <h2 className="relative mx-auto mt-6 max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Bắt đầu hồ sơ du học của bạn ngay hôm nay
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-balance text-primary-foreground/85">
            Xem báo giá miễn phí, đội ngũ tư vấn sẽ đồng hành cùng bạn trong từng bước.
          </p>

          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="h-11 bg-card px-6 text-base text-primary hover:bg-card/90"
              nativeButton={false}
              render={
                <Link href="#bao-gia">
                  Nhận báo giá miễn phí
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              }
            />
            <Button
              size="lg"
              variant="outline"
              className="h-11 border-white/40 bg-transparent px-6 text-base text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              nativeButton={false}
              render={<Link href="/portal">Vào cổng hồ sơ</Link>}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
