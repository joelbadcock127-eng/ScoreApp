create table if not exists public.visits (
  id bigint generated always as identity primary key,
  path text not null default '/',
  created_at timestamptz not null default now()
);
alter table public.visits enable row level security;
-- No anon policies: inserts go through the app server with the service role key.
