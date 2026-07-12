-- Per-account feature flags and AI usage cap, managed by the owner from
-- Manage accounts. Absent keys mean allowed/unlimited:
--   { "custom_domain": false, "custom_design": false, "ai_limit": 20 }
alter table public.accounts add column if not exists features jsonb not null default '{}'::jsonb;
alter table public.accounts add column if not exists ai_used int not null default 0;
