import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Chỉ áp dụng khi chạy `npm run dev`: cho phép mở site bằng 127.0.0.1 hoặc IP mạng LAN
  // (ví dụ http://192.168.1.3:3000 từ điện thoại). Nếu không khai báo, Next.js chặn file JS
  // (403) khiến trang không "kích hoạt" được và các nút như khung chat bấm không có phản ứng.
  allowedDevOrigins: ["127.0.0.1", "192.168.*.*", "10.*.*.*"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
