create table if not exists public.scorecard_config (
  id int primary key default 1 check (id = 1),
  config jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null default '',
  last_name text not null default '',
  email text not null default '',
  business text not null default '',
  contact_opt_in boolean not null default false,
  answers jsonb not null default '{}'::jsonb,
  score_total int,
  score_max int,
  overall_percent int,
  category_scores jsonb,
  status text not null default 'started',
  duration_seconds int,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.scorecard_config enable row level security;
alter table public.leads enable row level security;
-- No anon policies: all access goes through the app server using the service role key.
