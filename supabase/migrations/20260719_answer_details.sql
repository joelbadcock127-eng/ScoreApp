-- Human-readable answers (selected option labels, open text) alongside the
-- numeric scores, so survey responses are readable in the admin and emails.
alter table public.leads add column if not exists answer_details jsonb;
