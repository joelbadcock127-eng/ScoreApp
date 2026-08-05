-- Account-wide email signature (appended to invite + result emails for every
-- scorecard in the account) and per-lead custom field values (whatever extra
-- lead-form fields the scorecard collects, keyed by field key, so they can be
-- used as merge fields in emails).
alter table public.accounts add column if not exists email_signature jsonb;
alter table public.leads add column if not exists custom_fields jsonb not null default '{}'::jsonb;

notify pgrst, 'reload schema';
