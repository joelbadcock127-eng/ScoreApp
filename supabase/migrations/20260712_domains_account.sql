-- Custom subdomain per scorecard + account-level settings.
alter table public.scorecard_config add column if not exists domain text unique;
create table if not exists public.account (
  id int primary key default 1 check (id = 1),
  name text not null default 'My Account',
  email text not null default '',
  users jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.account enable row level security;
insert into public.account (id, name, email) values (1, 'Acceso AI', '') on conflict (id) do nothing;
