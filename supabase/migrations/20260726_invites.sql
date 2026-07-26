-- Distribution (Settings → Distribution): import a list, send personalised
-- invite emails, and honour unsubscribes.

-- Invited recipients live in `leads` with status 'invited' so each one gets a
-- personal quiz link and normal started/completed tracking once they click.
alter table public.leads add column if not exists invited_at timestamptz;

-- Account-wide suppression list. Anyone who unsubscribes from any of an
-- account's scorecards never receives another invite from that account.
create table if not exists public.suppressions (
  id bigint generated always as identity primary key,
  account_id bigint not null,
  email text not null,
  reason text not null default 'unsubscribe',
  created_at timestamptz not null default now(),
  unique (account_id, email)
);
alter table public.suppressions enable row level security;
-- No anon policies: all access goes through the app server's service role.
