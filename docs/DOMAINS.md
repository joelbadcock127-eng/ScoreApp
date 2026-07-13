# Domains — setup guide

Three kinds of host. DNS for `accesoai.com.au` is managed at **VentraIP**
(VIPControl → Domain Names → the domain → Managed DNS). The app is deployed on
**Vercel**. Records are resolved in `lib/server/config.ts`.

Env vars (Vercel → Settings → Environment Variables):

- `PUBLIC_BASE_DOMAIN` = `accesoai.com.au`
- `PUBLIC_APP_HOST` = the platform host, e.g. `score.accesoai.com.au`

Reserved subdomains (`www`, `app`, `score`, `admin`, `api`, …) can never be
claimed by a scorecard — see `RESERVED_SUBDOMAINS` in `config.ts`.

---

## 1. The platform host (`score.accesoai.com.au`)

One subdomain, no wildcard, no nameserver change — email untouched.

1. **Vercel** → project → Settings → Domains → **Add** `score.accesoai.com.au`.
   Vercel shows a CNAME target (`cname.vercel-dns.com`).
2. **VentraIP** → Managed DNS → add **CNAME**: Host `score`, Value
   `cname.vercel-dns.com`.
3. Set `PUBLIC_APP_HOST=score.accesoai.com.au` in Vercel and redeploy.
4. Wait a few minutes for SSL; visit `https://score.accesoai.com.au`.

Ensure Vercel's **Production Branch is `main`**.

---

## 2. Managed scorecard subdomains (`<slug>.accesoai.com.au`)

A wildcard on Vercel **requires** moving nameservers to Vercel (needed for
auto-renewing wildcard SSL). Until you want that, add subdomains individually —
safe, no email risk.

Per scorecard:

1. **VentraIP** → add **CNAME**: Host = the slug (e.g. `opportunity`), Value
   `cname.vercel-dns.com`.
2. **Vercel** → Add domain `opportunity.accesoai.com.au`.
3. In the app: open that scorecard → **Settings → Domain** → set the subdomain
   to `opportunity` → Save. The **Domain status** card shows "Live" once it
   resolves.

Use the **non-`www`** address (`opportunity.accesoai.com.au`). It's the clean
canonical URL and what the app shows as the Live URL.

### Making the `www.` version work too (optional)

`www.opportunity.accesoai.com.au` is a *separate* host and needs its own setup:

1. **VentraIP** → add **CNAME**: Host `www.opportunity`, Value
   `cname.vercel-dns.com`.
2. **Vercel** → Add domain `www.opportunity.accesoai.com.au`. Optionally set it
   to **redirect** to `opportunity.accesoai.com.au` (Vercel offers this on the
   domain).

The app already strips `www.` when resolving, so once the host is connected it
serves the same scorecard.

### Wildcard (later — instant, unlimited subdomains)

Only when you have enough scorecards to justify migrating DNS:

1. **Back up every DNS record** in VentraIP first — especially **MX** (email),
   **SPF/DKIM TXT**, and the main site's records.
2. Vercel → Add `accesoai.com.au` (apex) → choose **Vercel nameservers**.
3. **Recreate all backed-up records in Vercel DNS first** (MX, TXT, main site,
   `www`, `score`) so nothing goes dark.
4. VentraIP → change nameservers to Vercel's.
5. Vercel → add `*.accesoai.com.au`. Wildcard SSL issues automatically.

> ⚠️ Skipping step 3 takes your email and main website offline at cutover.

---

## 3. Customer custom domains (`quiz.theirbusiness.com`)

Independent of your VentraIP setup:

1. Customer adds **CNAME** `quiz → cname.vercel-dns.com` at their registrar.
2. You add `quiz.theirbusiness.com` in Vercel.
3. Customer sets it in their scorecard → **Settings → Domain** → custom domain.

Requires the account to have the *Own domain* feature enabled (Manage accounts
→ Features).

---

## Behaviour notes

- A subdomain/custom domain **not mapped** to any scorecard shows a 404
  ("This page isn't set up"), not the default scorecard.
- Every scorecard is always reachable at `score.accesoai.com.au/<slug>` and
  `/s/<id>` with zero DNS setup.
- The **Domain status** card in Settings → Domain server-pings each connected
  host (`/api/whoami`) and reports Live / Reachable / Not connected / Serving a
  different scorecard.
