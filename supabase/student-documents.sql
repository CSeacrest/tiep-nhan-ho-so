-- Hồ sơ học viên: giấy tờ đã nộp + thông tin AI trích xuất. DỮ LIỆU RIÊNG TƯ – chỉ server truy cập.
-- CÁCH DÙNG: Supabase Dashboard → SQL Editor → New query → dán toàn bộ file này → Run.
-- Chạy lại nhiều lần không lỗi (idempotent).

-- 1) Mỗi học viên = 1 hồ sơ. id là mã ngẫu nhiên giữ trong cookie httpOnly của trình duyệt
--    (tạm thời, tới khi có đăng nhập magic link ở Tuần 6 thì gắn với tài khoản).
create table if not exists public.student_profiles (
  id         uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Mỗi hồ sơ có tối đa 3 giấy tờ (mỗi loại 1 dòng; nộp lại thì ghi đè).
--    extracted là JSON các trường đọc được (họ tên, ngày sinh, điểm, số giấy tờ...).
create table if not exists public.student_documents (
  profile_id   uuid not null references public.student_profiles (id) on delete cascade,
  kind         text not null check (kind in ('transcript', 'ielts', 'identity')),
  file_name    text not null,
  mime_type    text not null,
  size_bytes   integer not null,
  storage_path text not null,
  status       text not null check (status in ('hop_le', 'can_nop_lai')),
  reason       text,
  extracted    jsonb,
  updated_at   timestamptz not null default now(),
  primary key (profile_id, kind)
);

-- 3) Kho lưu file gốc: bucket RIÊNG TƯ (public = false). Không tạo policy nào trên storage.objects
--    cho anon/authenticated → trình duyệt không đọc/ghi được; chỉ server (khoá secret) truy cập.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'student-documents', 'student-documents', false, 8388608,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- 4) BẢO MẬT: bật RLS, KHÔNG tạo policy, thu hồi mọi quyền của anon/authenticated.
alter table public.student_profiles  enable row level security;
alter table public.student_documents enable row level security;

revoke all on public.student_profiles  from anon, authenticated;
revoke all on public.student_documents from anon, authenticated;
