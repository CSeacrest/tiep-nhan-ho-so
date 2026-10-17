-- Danh sách trường tham chiếu (điểm chuẩn) – DỮ LIỆU CÔNG KHAI, ai cũng xem được.
-- CÁCH DÙNG: Supabase Dashboard → SQL Editor → New query → dán toàn bộ file này → Run.
-- Chạy lại nhiều lần không lỗi và không nhân đôi dữ liệu (idempotent).

create table if not exists public.reference_schools (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  country    text not null,
  min_gpa    numeric(3,1) not null check (min_gpa between 0 and 10),   -- điểm học tập tối thiểu (thang 10)
  min_ielts  numeric(2,1) not null check (min_ielts between 0 and 9),  -- IELTS tối thiểu
  created_at timestamptz not null default now(),
  unique (name, country)
);

-- BẢO MẬT: bật RLS; chỉ cho ĐỌC công khai (anon + đăng nhập). Không có policy ghi
-- → chỉ server dùng SUPABASE_SECRET_KEY hoặc SQL Editor mới thêm/sửa/xoá được.
alter table public.reference_schools enable row level security;

drop policy if exists "reference_schools_public_read" on public.reference_schools;
create policy "reference_schools_public_read"
  on public.reference_schools for select
  to anon, authenticated
  using (true);

revoke all on public.reference_schools from anon, authenticated;
grant select on public.reference_schools to anon, authenticated;

insert into public.reference_schools (name, country, min_gpa, min_ielts) values
  ('Đại học Deakin',     'Úc',        7.0, 6.0),
  ('Đại học Swinburne',  'Úc',        7.0, 6.0),
  ('Đại học Melbourne',  'Úc',        8.5, 7.0),
  ('Đại học Auckland',   'New Zealand', 7.5, 6.5)
on conflict (name, country) do update
  set min_gpa = excluded.min_gpa, min_ielts = excluded.min_ielts;
