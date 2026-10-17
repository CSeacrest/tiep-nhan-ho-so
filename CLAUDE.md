# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Quy tắc Git (bắt buộc)

- **Không bao giờ đưa `.env` hoặc API key lên Git.** Không `git add` / commit bất kỳ file `.env*` nào (trừ `.env.example`, chỉ chứa tên biến, không có giá trị thật), không dùng `git add -f`, không dán khoá vào mã nguồn hay tài liệu. Cần cấu hình thì ghi tên biến vào `.env.example`.
- **Luôn hỏi người dùng trước khi commit hoặc push lên Git**, kể cả khi họ đã đồng ý ở lần trước; đồng ý một lần không áp dụng cho lần sau. Nêu rõ sẽ commit những file nào và đẩy lên nhánh/remote nào, rồi chờ xác nhận.
- Các lớp bảo vệ đã cài sẵn: `.gitignore` chặn `.env*`; `.claude/settings.json` bắt hỏi quyền với `git commit`/`git push`; hook cục bộ `.git/hooks/pre-commit` chặn file `.env` và nội dung giống khoá bí mật, `.git/hooks/pre-push` bắt người dùng gõ xác nhận trong terminal (nên Claude không tự push được, hãy đề nghị người dùng tự chạy `git push`). Hook nằm trong `.git/` nên không đi theo repo khi clone; máy mới cần tạo lại.

## Tổng quan

DuHoc24 – website mẫu "Cổng Tiếp Nhận Hồ Sơ Du Học" cho khoá lập trình 6 tuần. Repo đang ở **Tuần 1: chỉ có UI tĩnh**, toàn bộ dữ liệu là mock viết cứng, chưa có API, database hay xác thực. README.md có lộ trình các tuần tiếp theo (Gemini ở Tuần 2, Supabase ở Tuần 3–4, Make.com ở Tuần 5, magic link ở Tuần 6); khi thêm tính năng, đối chiếu với lộ trình đó thay vì tự nghĩ ra kiến trúc mới.

Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4, shadcn/ui. AGENTS.md cảnh báo phiên bản Next.js này có breaking change so với kiến thức cũ: đọc `node_modules/next/dist/docs/` trước khi viết code liên quan đến Next.js (cần `npm install` trước vì `node_modules` không nằm trong repo).

## Lệnh thường dùng

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run start
npm run lint     # eslint (cấu hình flat trong eslint.config.mjs)
```

Chưa có test runner nào được cấu hình. Không cần biến môi trường để chạy `npm run dev`; `.env.example` chỉ liệt kê biến sẽ dùng cho Supabase và `NEXT_PUBLIC_SITE_URL` ở các tuần sau.

## Kiến trúc

- **Dữ liệu tập trung ở `lib/mock-data.ts`**: định nghĩa kiểu (`DocStatus`, `RequestStatus`, `ServicePackage`, `School`, `AdmissionRequest`…) và mảng dữ liệu giả (trường, gói dịch vụ, yêu cầu báo giá, hồ sơ, hội thoại). Mọi trang và component đều import từ file này. Khi nối Supabase, đây là chỗ cần thay; giữ nguyên các kiểu để UI không phải sửa nhiều. Giá trị trạng thái dùng mã không dấu (`cho_duyet`, `hop_le`…), còn chữ hiển thị tiếng Việt do `components/status-badge.tsx` ánh xạ.
- **Ba khu vực giao diện trong `app/`**:
  - `/` (`app/page.tsx`) là landing page ghép từ `components/landing/*` (hero, form báo giá, điểm nổi bật, chat widget). `chat-widget.tsx` hiện trả lời bằng bảng câu trả lời cứng (`cannedAnswers`), chưa gọi AI.
  - `/portal` là cổng hồ sơ học viên, ghép từ `components/portal/*`.
  - `/admin/*` dùng chung `app/admin/layout.tsx` (sidebar + nav di động từ `components/admin/`). `/admin` chuyển hướng sang `/admin/requests`; các trang con: `requests`, `schools`, `profiles`, `conversations`.
- `/login` chưa tồn tại và cố ý để dành cho Tuần 6; `/portal` hiện chưa được bảo vệ.

## Quy ước

- Alias import `@/*` trỏ về gốc repo (`@/components/...`, `@/lib/...`).
- `components/ui/*` do shadcn sinh ra (style `base-nova`, nền tảng Base UI, không phải Radix). Thêm component bằng `npx shadcn add <tên>` thay vì viết tay; cấu hình ở `components.json`. Registry `@tailark-oss` đã được khai báo (khối giao diện nền là `@tailark-oss/dusk-landing-2`, đã chỉnh sang light theme).
- Tailwind v4 cấu hình qua CSS (`app/globals.css`, `postcss.config.mjs`), không có `tailwind.config`.
- Nội dung giao diện và dữ liệu mock đều bằng tiếng Việt.
