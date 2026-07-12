# Acceso AI Scorecards

A multi-account scorecard platform (originally a rebuild of the Acceso AI ScoreApp scorecard).
Next.js + Tailwind on the front, Supabase for storage, the Claude API (Haiku) for the AI Builder.

## How it fits together

- **Base domain `/`** — product landing page with **log in / create account** (email + password).
  Logged-in users land on their account dashboard.
- **Accounts** — every user has their own account and their own scorecards. The **owner**
  account can additionally manage all accounts at *Account → Manage accounts* (create,
  rename, reset passwords, delete). Passwords are scrypt-hashed; sessions are signed
  HMAC cookies.
- **Scorecards** — each account can create any number. Public URLs: `/s/<id>`, a managed
  subdomain (`<sub>.accesoai.com.au`) or a fully custom domain. New scorecards start from
  a *generic* blank template (`lib/blankConfig.ts`) — nothing from the AI Opportunity
  scorecard leaks into them; that content lives only in scorecard #1 (`lib/defaultConfig.ts`).
- **AI Builder** (`/account/ai-builder`) — describe branding + the scorecard idea; Claude
  (`claude-haiku-4-5`) generates the landing page, categories, questions, results pages and
  PDF report as **schema-constrained JSON** (never code), in four steps: strategy → landing +
  questions → results → PDF. A review screen shows the outline with warnings, then saving
  creates a normal scorecard you edit in the existing editors. The scoring engine is fixed:
  1–5 scale questions, high = good, low/medium/high tiers.
  - Without `ANTHROPIC_API_KEY` (or with `AI_BUILDER_MOCK=1`) the builder runs in **sample
    mode** — placeholder content, zero API calls — so the flow can be tested for free.
  - A full generation is 4 Haiku calls, roughly 15–25k output tokens ≈ **US$0.08–0.15**.
- **Admin** (`/admin`) — per-scorecard dashboard: leads, visual editors for landing /
  questions / results / PDF, branding, domains, emails, embeds.

## Setup

1. Supabase project with the migrations in `supabase/migrations` applied (already applied to
   the "ScoreApp" project). All tables have RLS on with **no** anon policies; all access goes
   through the app server with the service role key.
2. Environment variables (see `.env.example`):
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET` — signs login cookies (falls back to `ADMIN_PASSWORD`)
   - `ANTHROPIC_API_KEY` — enables real AI Builder generation (keep it in the deployment's
     env settings only; never commit it)
   - `AI_BUILDER_MOCK=1` — force sample mode even with a key
3. `npm install && npm run dev`

Scoring: each answer scores its position (1–5). Category % = points / max points;
overall % = total points / max total.

## Domains

Three kinds of host, resolved in `lib/server/config.ts`:

1. **Platform** — the dashboard/marketing site, e.g. `score.accesoai.com.au`.
   Set `PUBLIC_APP_HOST` to this exact host (plus `PUBLIC_BASE_DOMAIN=accesoai.com.au`).
   Reserved subdomains (`www`, `app`, `score`, `admin`, …) can never be claimed by a scorecard.
2. **Managed scorecard subdomains** — `<slug>.accesoai.com.au` set per scorecard in
   *Settings → Domain*. Requires a wildcard `*.accesoai.com.au` DNS record pointing at the
   deployment (on Vercel this means using Vercel nameservers, or adding each subdomain
   individually). Each scorecard is also always reachable at `/<slug>` and `/s/<id>` on the
   platform host.
3. **Customer custom domains** — e.g. `scorecard.client.com`: the customer CNAMEs their
   host to the deployment, the domain is added to the hosting project, and the scorecard
   sets it in *Settings → Domain*.

