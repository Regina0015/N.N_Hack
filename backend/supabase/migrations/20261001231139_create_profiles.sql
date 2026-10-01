-- Onboarding profile: one row per user; the validated profile lives in `data` (see backend/app/schemas.py).
create table public.profiles (
  user_id varchar(64) primary key,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The public schema is reachable through Supabase's Data API with the public anon key.
-- RLS without policies blocks that path, and revoking grants hides the table from it entirely.
-- The backend connects as the table owner, so its own queries are unaffected.
alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
