-- Lưu hội thoại chatbot trang chủ.
-- CÁCH DÙNG: Supabase Dashboard → SQL Editor → New query → dán toàn bộ file này → Run.
-- File chạy lại nhiều lần không lỗi (idempotent).

-- 1) Mỗi lần khách mở trang và bắt đầu chat = 1 cuộc hội thoại.
--    visitor_id là ID ẩn danh riêng của từng trình duyệt (tạo ở phía trình duyệt, giữ trong localStorage).
create table if not exists public.chat_conversations (
  id              uuid primary key,
  visitor_id      uuid not null,
  user_agent      text,
  created_at      timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  message_count   integer not null default 0
);

create index if not exists chat_conversations_visitor_idx on public.chat_conversations (visitor_id);
create index if not exists chat_conversations_last_msg_idx on public.chat_conversations (last_message_at desc);

-- 2) Từng tin nhắn: role = 'user' (khách) hoặc 'assistant' (chatbot).
create table if not exists public.chat_messages (
  id              bigint generated always as identity primary key,
  conversation_id uuid not null references public.chat_conversations (id) on delete cascade,
  visitor_id      uuid not null,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  created_at      timestamptz not null default now()
);

create index if not exists chat_messages_conv_idx on public.chat_messages (conversation_id, created_at, id);
create index if not exists chat_messages_visitor_idx on public.chat_messages (visitor_id);

-- 3) Tự cập nhật số tin nhắn và thời điểm tin nhắn cuối của cuộc hội thoại.
create or replace function public.chat_touch_conversation()
returns trigger
language plpgsql
as $$
begin
  update public.chat_conversations
     set message_count   = message_count + 1,
         last_message_at = greatest(last_message_at, new.created_at)
   where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists chat_messages_touch on public.chat_messages;
create trigger chat_messages_touch
  after insert on public.chat_messages
  for each row execute function public.chat_touch_conversation();

-- 4) BẢO MẬT: bật Row Level Security và KHÔNG tạo policy nào
--    → khoá publishable (anon) và người dùng đăng nhập không đọc/ghi được bảng này.
--    Chỉ server (dùng SUPABASE_SECRET_KEY) mới đọc/ghi được.
alter table public.chat_conversations enable row level security;
alter table public.chat_messages      enable row level security;

revoke all on public.chat_conversations from anon, authenticated;
revoke all on public.chat_messages      from anon, authenticated;
