# The AI Opportunity Assessment — ScoreApp rebuild

A standalone rebuild of the Acceso AI scorecard originally built on ScoreApp
(https://accesoai.scoreapp.com/). Next.js + Tailwind on the front, Supabase for storage.

## What's included

- **Landing page** (`/`) — hero, "Assess Your Business in Four Key Areas" cards, bottom CTA,
  lead-capture popup. Fully responsive.
- **Quiz** (`/quiz`) — 23 linear-scale questions (1–5) with left/centre/right labels,
  back navigation and a completion bar, one question per screen.
- **Results** (`/results/[id]`) — speed-chart gauge, overall score, and **dynamic content on
  three score tiers** (Low 0–50, Medium 51–79, High 80–100): tier-specific intro plus
  tier-specific text for each of the four categories, "Next steps?" CTA, share bar,
  "Update your details" popup.
- **Admin** (`/admin`, password-gated) —
  - **Leads**: searchable list (name, email, date, completion time, score), CSV export,
    per-lead detail with overall/category donuts and an Answers tab.
  - **Settings → Score Tiers**: edit tier colours, labels and score ranges.
  - **Settings → Lead Form**: edit the signup form fields (label, type, required, enabled).

Scoring: each answer scores its position (1–5). Category % = points / max points;
overall % = total points / 115, matching ScoreApp's numbers exactly.

## Setup

1. Create a Supabase project and run the migration in `supabase/migrations`
   (already applied to the "ScoreApp" project) — tables `scorecard_config` and `leads`
   with RLS enabled and **no** anon policies; all access goes through the app server
   with the service role key.
2. Copy `.env.example` to `.env.local` and fill in:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Supabase dashboard -> Settings -> API)
   - `ADMIN_PASSWORD` (protects `/admin`)
3. `npm install && npm run dev`

All scorecard content (questions, tier texts, landing copy) is seeded from
`lib/defaultConfig.ts` into the `scorecard_config` table on first load; tiers and the
lead form are then editable from the admin settings.

## Not wired up (yet)

- **Result / abandon emails** — the results page says "Your full report has been emailed…"
  to match the original, but no email is sent. Needs an email provider (e.g. Resend/Postmark).
- **PDF report** — "Open my Report" is a placeholder; ScoreApp's PDF report builder is a
  separate feature.

Reference screenshots of the original ScoreApp scorecard live in
`docs/reference-screenshots/` (see `docs/screenshot-map.md`).
