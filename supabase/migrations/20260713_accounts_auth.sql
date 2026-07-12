-- Real multi-account auth: email + password accounts, scorecards owned by an
-- account. The previous single-row `account` table becomes per-account data.
create table if not exists public.accounts (
  id bigint generated always as identity primary key,
  name text not null default 'My Account',
  email text not null,
  password_hash text not null default '',
  role text not null default 'member', -- 'owner' can manage other accounts
  users jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists accounts_email_key on public.accounts (lower(email));
alter table public.accounts enable row level security;
-- No anon policies: all access goes through the app server with the service role key.

-- Seed the owner account (Joel). Name carried over from the legacy account row.
insert into public.accounts (name, email, password_hash, role, users)
select
  coalesce((select nullif(a.name, '') from public.account a where a.id = 1), 'Acceso AI'),
  'joel.badcock127@gmail.com',
  's2$e08954deec3506e10b0a1435561ea206$a5ba9d8fcb2e87c0f86f998dcae83ab72ff619e9514634bb277d6656591be54f5bb793696acd25e85742554ad6289e0fb8021fd80e98dfe150f19edcf302bb08',
  'owner',
  coalesce((select a.users from public.account a where a.id = 1), '[]'::jsonb)
where not exists (select 1 from public.accounts where lower(email) = 'joel.badcock127@gmail.com');

-- Every scorecard belongs to an account; existing ones go to the owner.
alter table public.scorecard_config add column if not exists account_id bigint;
update public.scorecard_config
set account_id = (select id from public.accounts where role = 'owner' order by id limit 1)
where account_id is null;
create index if not exists scorecard_config_account_idx on public.scorecard_config (account_id);
