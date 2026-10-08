-- Coach chat memory: one row per turn, read back per user in id order (see backend/app/routers/coach.py).
create table public.chat_messages (
  id bigint generated always as identity primary key,
  user_id varchar(64) not null,
  role varchar(16) not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index chat_messages_user_id_id_idx on public.chat_messages (user_id, id);

-- Same lockdown as profiles: only the backend (table owner) reads or writes chat history.
alter table public.chat_messages enable row level security;
revoke all on table public.chat_messages from anon, authenticated;
