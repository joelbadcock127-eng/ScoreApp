-- Allow multiple scorecards: drop the single-row check, add identity metadata,
-- and tag leads/visits with their scorecard.
alter table public.scorecard_config drop constraint if exists scorecard_config_id_check;
create sequence if not exists public.scorecard_config_id_seq start 2;
alter table public.scorecard_config alter column id set default nextval('public.scorecard_config_id_seq');
alter table public.scorecard_config add column if not exists name text not null default 'Scorecard';
alter table public.scorecard_config add column if not exists is_default boolean not null default false;
alter table public.scorecard_config add column if not exists created_at timestamptz not null default now();
update public.scorecard_config set is_default = true where id = 1;
alter table public.leads add column if not exists scorecard_id int not null default 1;
alter table public.visits add column if not exists scorecard_id int not null default 1;
create index if not exists leads_scorecard_idx on public.leads (scorecard_id, created_at);
create index if not exists visits_scorecard_idx on public.visits (scorecard_id, created_at);
