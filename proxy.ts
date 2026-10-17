import { NextResponse, type NextRequest } from "next/server";

// Bảo vệ toàn bộ khu /admin bằng mật khẩu (HTTP Basic Auth), vì trang quản trị hiển thị tin nhắn thật của khách.
//  - Đặt ADMIN_PASSWORD (và tuỳ chọn ADMIN_USER, mặc định "admin") trong .env.local / Vercel Environment Variables.
//  - Chạy production mà chưa đặt ADMIN_PASSWORD: chặn hẳn (503) thay vì để mở công khai.
//  - Chạy dev (npm run dev) mà chưa đặt ADMIN_PASSWORD: cho vào để tiện phát triển.
// Đây là lớp bảo vệ tạm thời cho tới khi làm đăng nhập thật bằng Supabase Auth (Tuần 6).

function safeEqual(a: string, b: string): boolean {
  // So sánh không dừng sớm để tránh lộ độ dài/ký tự đúng qua thời gian phản hồi
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

function parseBasic(header: string | null): { user: string; pass: string } | null {
  if (!header) return null;
  const [scheme, encoded] = header.split(" ");
  if (scheme?.toLowerCase() !== "basic" || !encoded) return null;
  try {
    const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    const i = decoded.indexOf(":");
    if (i < 0) return null;
    return { user: decoded.slice(0, i), pass: decoded.slice(i + 1) };
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Trang quản trị chưa được bật: hãy đặt biến môi trường ADMIN_PASSWORD.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    return NextResponse.next();
  }

  const expectedUser = process.env.ADMIN_USER || "admin";
  const cred = parseBasic(request.headers.get("authorization"));
  if (cred && safeEqual(cred.user, expectedUser) && safeEqual(cred.pass, password)) {
    return NextResponse.next();
  }

  return new NextResponse("Cần đăng nhập để vào trang quản trị.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="DuHoc24 Admin", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
