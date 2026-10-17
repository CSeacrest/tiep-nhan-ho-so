-- Danh sách học bổng theo từng trường – DỮ LIỆU CÔNG KHAI, ai cũng xem được.
-- Phụ thuộc supabase/reference-schools.sql (bảng reference_schools phải có trước).
-- CÁCH DÙNG: Supabase Dashboard → SQL Editor → New query → dán toàn bộ file này → Run.
-- Chạy lại nhiều lần không lỗi và không nhân đôi dữ liệu (idempotent).

create table if not exists public.scholarships (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,                                                   -- tên học bổng
  school_id       uuid not null references public.reference_schools (id) on delete cascade, -- trường áp dụng
  min_gpa         numeric(3,1) check (min_gpa between 0 and 10),                   -- điều kiện điểm học tập tối thiểu (thang 10); null = không yêu cầu
  min_ielts       numeric(2,1) check (min_ielts between 0 and 9),                  -- điều kiện IELTS tối thiểu; null = không yêu cầu
  support_type    text not null check (support_type in ('percent', 'full')),       -- loại hỗ trợ: theo % học phí hoặc toàn phần
  support_percent integer check (support_percent between 1 and 100),               -- % học phí (khi support_type = 'percent')
  support_text    text not null,                                                   -- mức hỗ trợ dạng chữ để hiển thị, vd "25% học phí"
  created_at      timestamptz not null default now(),
  unique (school_id, name),
  check (min_gpa is not null or min_ielts is not null),
  check ((support_type = 'percent') = (support_percent is not null))
);

create index if not exists scholarships_school_idx on public.scholarships (school_id);

-- BẢO MẬT: bật RLS; chỉ cho ĐỌC công khai (anon + đăng nhập). Không có policy ghi
-- → chỉ server dùng SUPABASE_SECRET_KEY hoặc SQL Editor mới thêm/sửa/xoá được.
alter table public.scholarships enable row level security;

drop policy if exists "scholarships_public_read" on public.scholarships;
create policy "scholarships_public_read"
  on public.scholarships for select
  to anon, authenticated
  using (true);

revoke all on public.scholarships from anon, authenticated;
grant select on public.scholarships to anon, authenticated;

insert into public.scholarships (name, school_id, min_gpa, min_ielts, support_type, support_percent, support_text)
select v.name, s.id, v.min_gpa, v.min_ielts, v.support_type, v.support_percent, v.support_text
from (values
  ('Merit Deakin',               'Đại học Deakin',    8.0::numeric, null::numeric, 'percent', 25,   '25% học phí'),
  ('Global Excellence',          'Đại học Swinburne', null,         7.0,           'percent', 20,   '20% học phí'),
  ('Chancellor''s Scholarship',  'Đại học Melbourne', 9.0,          null,          'full',    null, 'Toàn phần'),
  ('International Excellence',   'Đại học Auckland',  7.5,          null,          'percent', 15,   '15% học phí')
) as v(name, school_name, min_gpa, min_ielts, support_type, support_percent, support_text)
join public.reference_schools s on s.name = v.school_name
on conflict (school_id, name) do update
  set min_gpa = excluded.min_gpa, min_ielts = excluded.min_ielts, support_type = excluded.support_type,
      support_percent = excluded.support_percent, support_text = excluded.support_text;
