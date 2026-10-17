"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import React from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Quy trình", href: "/#quy-trinh" },
  { name: "Giấy tờ", href: "/#giay-to" },
  { name: "Điểm chuẩn", href: "/#diem-chuan" },
  { name: "Hỏi đáp", href: "/#hoi-dap" },
  { name: "Cổng hồ sơ", href: "/portal" },
  { name: "Admin", href: "/admin" },
];

// Khu /admin có mật khẩu: KHÔNG được prefetch từ trang công khai, nếu không yêu cầu tải trước sẽ nhận 401
// và trình duyệt hiện hộp thoại đăng nhập ngay ở trang chủ. (undefined = giữ hành vi prefetch mặc định)
const noPrefetch = (href: string) => (href.startsWith("/admin") ? false : undefined);

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 z-40 w-full border-b border-primary/10 bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/75">
      <nav className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between gap-6 py-3.5">
          <Link href="/" aria-label="Về trang chủ" className="flex items-center text-primary">
            <Logo uniColor className="text-primary [&>span:last-child]:text-foreground [&_span]:text-lg" />
          </Link>

          <ul className="hidden items-center gap-7 text-sm lg:flex">
            {menuItems.map((item) => {
              const active = !item.href.includes("#") && pathname.startsWith(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    prefetch={noPrefetch(item.href)}
                    className={cn(
                      "block duration-150 hover:text-primary",
                      active ? "font-semibold text-primary" : "text-muted-foreground",
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <Button
              className="hidden rounded-full px-5 shadow-md shadow-primary/20 sm:inline-flex"
              nativeButton={false}
              render={<Link href="/#bao-gia">Nhận báo giá</Link>}
            />
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={menuOpen}
              className="relative z-20 flex size-9 items-center justify-center rounded-md text-foreground lg:hidden"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <ul className="space-y-1 border-t border-primary/10 py-4 lg:hidden">
            {menuItems.map((item) => {
              const active = !item.href.includes("#") && pathname.startsWith(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    prefetch={noPrefetch(item.href)}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "block rounded-xl px-3 py-2.5 text-base duration-150",
                      active
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2">
              <Button
                className="w-full rounded-full"
                nativeButton={false}
                render={
                  <Link href="/#bao-gia" onClick={() => setMenuOpen(false)}>
                    Nhận báo giá
                  </Link>
                }
              />
            </li>
          </ul>
        )}
      </nav>
    </header>
  );
}
