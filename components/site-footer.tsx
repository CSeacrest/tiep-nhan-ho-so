import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/logo";

const links = [
  { name: "Trang chủ", href: "/" },
  { name: "Quy trình", href: "/#quy-trinh" },
  { name: "Điểm chuẩn các trường", href: "/#diem-chuan" },
  { name: "Hỏi đáp", href: "/#hoi-dap" },
  { name: "Cổng hồ sơ", href: "/portal" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-primary/10 bg-linear-to-b from-secondary/60 to-accent/60">
      <div className="mx-auto max-w-7xl space-y-10 px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-full lg:col-span-2">
            <Logo uniColor className="text-primary [&>span:last-child]:text-foreground [&_span]:text-lg" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Tư vấn hồ sơ du học, rõ ràng từ báo giá đến xét duyệt. Đồng hành cùng học viên từ bước chọn trường
              đến khi hoàn tất hồ sơ.
            </p>
          </div>

          <div>
            <span className="text-sm font-semibold text-foreground">Liên hệ</span>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-primary" />
                <span>hotro@duhoc24.vn</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-primary" />
                <span>1900 636 999</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0 text-primary" />
                <span>Quận 1, TP. Hồ Chí Minh</span>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-sm font-semibold text-foreground">Liên kết</span>
            <ul className="mt-4 space-y-3 text-sm">
              {links.map((l) => (
                <li key={l.name}>
                  <Link href={l.href} className="text-muted-foreground duration-150 hover:text-primary">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/10 pt-6">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 DuHoc24. Website mẫu dùng cho mục đích đào tạo.
          </p>
        </div>
      </div>
    </footer>
  );
}
