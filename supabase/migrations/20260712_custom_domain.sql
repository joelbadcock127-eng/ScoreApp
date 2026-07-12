-- Fully custom domains the customer owns (e.g. scorecard.mybusiness.com),
-- alongside the managed <sub>.accesoai.com.au subdomains.
alter table scorecard_config add column if not exists custom_domain text;
create unique index if not exists scorecard_config_custom_domain_key
  on scorecard_config (custom_domain) where custom_domain is not null;
