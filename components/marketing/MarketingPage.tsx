/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import Reveal from '@/components/Reveal';

// ---------------------------------------------------------------------------
// Public homepage at the base domain. Demo-landing-page style: hero with
// product visual, proof strip, three deep-dive feature blocks with mockups,
// dark "how it works" band, capability grid, stats band and a final CTA.
// Scorecards themselves live on their own subdomains, /<slug> and /s/<id>.
// ---------------------------------------------------------------------------

const HERO_CHECKS = [
  'AI drafts your questions, results and PDF report',
  'Every visitor gets a personalised score and next steps',
  'Leads land in your dashboard the moment they answer',
];

const PROOF_POINTS = [
  { stat: 'Minutes', label: 'from idea to a complete, publishable draft' },
  { stat: 'Zero code', label: 'everything is edited visually, in the browser' },
  { stat: '1 link', label: 'on your own subdomain or custom domain' },
  { stat: '24/7', label: 'lead capture with instant email delivery' },
];

const GRID_FEATURES = [
  {
    title: 'AI Builder',
    body: 'Describe your business and audience — get a full scorecard drafted for you: landing page, questions, scoring, results and report.',
    icon: (
      <>
        <path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3Z" />
        <path d="M18.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" />
      </>
    ),
  },
  {
    title: 'Visual editor',
    body: 'Click any word, image or colour and change it. What you see in the editor is exactly what your visitors get.',
    icon: (
      <>
        <path d="M4 20l4-1 11-11-3-3L5 16l-1 4Z" />
        <path d="M13.5 6.5l3 3" />
      </>
    ),
  },
  {
    title: 'Smart scoring',
    body: 'Weight questions and areas however you like. Scores roll up into tiers with tailored messaging for each band.',
    icon: (
      <>
        <path d="M4 19V9M10 19V5M16 19v-8M21 19H3" />
      </>
    ),
  },
  {
    title: 'Personalised results',
    body: 'Results pages adapt to every respondent — their score, their strengths, their recommended next steps.',
    icon: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c1.2-3.2 3.8-4.8 7-4.8s5.8 1.6 7 4.8" />
      </>
    ),
  },
  {
    title: 'Branded PDF reports',
    body: 'A polished, downloadable report generated for every lead — your logo, your colours, their numbers.',
    icon: (
      <>
        <path d="M7 3h7l4 4v14H7V3Z" />
        <path d="M14 3v4h4M10 13h5M10 16.5h5" />
      </>
    ),
  },
  {
    title: 'Instant lead capture',
    body: 'Collect name, email and any custom fields before results are revealed. Every lead is stored with full answers.',
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7.5l9 6 9-6" />
      </>
    ),
  },
  {
    title: 'Your own domain',
    body: 'Publish each scorecard on a managed subdomain, or connect a custom domain for a fully white-label feel.',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 3.8 6 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-6-3.8-9S9.5 5.7 12 3Z" />
      </>
    ),
  },
  {
    title: 'Embed anywhere',
    body: 'Drop your scorecard into any existing site with a lightweight embed script — no rebuild required.',
    icon: (
      <>
        <path d="M9 8l-4 4 4 4M15 8l4 4-4 4" />
      </>
    ),
  },
];

const STEPS = [
  {
    title: 'Describe it',
    body: 'Tell the AI Builder about your business, your audience and what the score should measure.',
  },
  {
    title: 'Make it yours',
    body: 'Review the complete draft, then fine-tune copy, colours, images and scoring in the visual editor.',
  },
  {
    title: 'Publish & capture',
    body: 'Share one link. Visitors get personalised results and PDF reports — you get qualified leads.',
  },
];

function Icon({ children, className = 'h-6 w-6' }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

function Check() {
  return (
    <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
        <path d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}

function CtaButtons({ loggedIn, light = false }: { loggedIn: boolean; light?: boolean }) {
  if (loggedIn) {
    return (
      <Link
        href="/account"
        className={
          light
            ? 'inline-block rounded-lg bg-white px-8 py-3.5 font-semibold text-navy shadow-lg transition hover:brightness-95'
            : 'inline-block rounded-lg bg-primary px-8 py-3.5 font-semibold text-white shadow-lg shadow-primary/25 transition hover:brightness-110'
        }
      >
        Go to dashboard
      </Link>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Link
        href="/login?mode=signup"
        className={
          light
            ? 'rounded-lg bg-white px-8 py-3.5 font-semibold text-navy shadow-lg transition hover:brightness-95'
            : 'rounded-lg bg-primary px-8 py-3.5 font-semibold text-white shadow-lg shadow-primary/25 transition hover:brightness-110'
        }
      >
        Build your scorecard free
      </Link>
      <Link
        href="/login"
        className={
          light
            ? 'rounded-lg border border-white/30 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10'
            : 'rounded-lg border border-gray-300 px-8 py-3.5 font-semibold text-ink transition hover:bg-gray-50'
        }
      >
        Log in
      </Link>
    </div>
  );
}

/* ------------------------------- Mockups -------------------------------- */
/* Lightweight CSS product mockups used inside the feature blocks so the page
   stays fast and always on-brand. */

function BuilderMockup() {
  return (
    <div className="relative">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <span className="h-2.5 w-2.5 rounded-full bg-tier-low/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-tier-medium/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-tier-high/60" />
          <span className="ml-2 text-xs font-medium text-muted">AI Builder</span>
        </div>
        <div className="mt-4 flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-white">
            I run a marketing agency — build me a &ldquo;Marketing Readiness Score&rdquo; for small business owners.
          </div>
        </div>
        <div className="mt-3 flex justify-start">
          <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-2.5 text-sm text-ink">
            Done — I&rsquo;ve drafted your landing page, 12 questions across 4 areas, tiered results and a branded PDF report.
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {['Landing', 'Questions', 'Results', 'PDF'].map((t) => (
            <div key={t} className="rounded-lg border border-primary/20 bg-primary/5 px-2 py-2 text-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-3.5 w-3.5 text-tier-high">
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span className="mt-1 block text-[11px] font-semibold text-navy">{t}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -right-4 -top-4 rounded-xl bg-navy px-4 py-2.5 text-white shadow-card">
        <span className="block text-[11px] uppercase tracking-wide text-white/60">Draft ready in</span>
        <span className="text-lg font-bold">minutes</span>
      </div>
    </div>
  );
}

function ResultsMockup() {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card">
        <div className="flex items-center gap-5">
          <svg viewBox="0 0 84 84" className="h-24 w-24 flex-none">
            <circle cx="42" cy="42" r={r} fill="none" stroke="#e5e7eb" strokeWidth="9" />
            <circle
              cx="42"
              cy="42"
              r={r}
              fill="none"
              stroke="rgb(28 120 254)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${c * 0.78} ${c}`}
              transform="rotate(-90 42 42)"
            />
            <text x="42" y="47" textAnchor="middle" className="fill-navy" fontSize="20" fontWeight="700">
              78
            </text>
          </svg>
          <div>
            <span className="inline-block rounded-full bg-tier-high/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-tier-high">
              High potential
            </span>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Sarah, you&rsquo;re ahead of most — here are the 3 moves that will take you further.
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {[
            { label: 'Strategy', val: 85, color: 'bg-tier-high' },
            { label: 'Channels', val: 62, color: 'bg-primary' },
            { label: 'Automation', val: 44, color: 'bg-tier-medium' },
          ].map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-xs font-semibold text-navy">
                <span>{b.label}</span>
                <span>{b.val}/100</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-gray-100">
                <div className={`h-2 rounded-full ${b.color}`} style={{ width: `${b.val}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-4 -left-4 flex items-center gap-2.5 rounded-xl bg-white px-4 py-3 shadow-card">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-tier-low/10 text-tier-low">
          <Icon className="h-5 w-5">
            <path d="M7 3h7l4 4v14H7V3Z" />
            <path d="M14 3v4h4M10 13h5M10 16.5h5" />
          </Icon>
        </span>
        <div>
          <span className="block text-xs font-bold text-navy">PDF report</span>
          <span className="text-[11px] text-muted">generated &amp; emailed</span>
        </div>
      </div>
    </div>
  );
}

function LeadsMockup() {
  const leads = [
    { name: 'Sarah Nguyen', score: 78, tier: 'High', color: 'text-tier-high bg-tier-high/10' },
    { name: 'James Carter', score: 55, tier: 'Medium', color: 'text-tier-medium bg-tier-medium/10' },
    { name: 'Priya Sharma', score: 91, tier: 'High', color: 'text-tier-high bg-tier-high/10' },
  ];
  return (
    <div className="relative">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <span className="text-sm font-semibold text-navy">New leads</span>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">+3 today</span>
        </div>
        <div className="mt-2 divide-y divide-gray-50">
          {leads.map((l) => (
            <div key={l.name} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/5 text-xs font-bold text-navy">
                  {l.name.split(' ').map((p) => p[0]).join('')}
                </span>
                <div>
                  <span className="block text-sm font-semibold text-ink">{l.name}</span>
                  <span className="text-xs text-muted">Full answers captured</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${l.color}`}>{l.tier}</span>
                <span className="text-sm font-bold text-navy">{l.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -right-4 -top-4 flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-card">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4.5 w-4.5">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7.5l9 6 9-6" />
          </Icon>
        </span>
        <span className="text-xs font-bold text-navy">
          Result email sent <span className="block font-medium text-muted">automatically</span>
        </span>
      </div>
    </div>
  );
}

/* --------------------------------- Page ---------------------------------- */

export default function MarketingPage({ loggedIn = false }: { loggedIn?: boolean }) {
  return (
    <main className="min-h-screen bg-white text-ink">
      {/* Sticky nav */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <img src="/images/logo.png" alt="Acceso AI" className="h-9 w-auto" />
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
            <a href="#product" className="hover:text-ink">Product</a>
            <a href="#how-it-works" className="hover:text-ink">How it works</a>
            <a href="#features" className="hover:text-ink">Features</a>
          </nav>
          <div className="flex items-center gap-3">
            {loggedIn ? (
              <Link href="/account" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-100">
                  Log in
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  Get started free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 right-[-15%] h-[540px] w-[540px] rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-30%] left-[-10%] h-[420px] w-[420px] rounded-full bg-navy/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pb-24 pt-14 md:grid-cols-2 md:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-primary">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3Z" />
              </svg>
              AI-powered scorecard builder
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-navy md:text-[3.4rem]">
              Turn your traffic into <span className="text-primary">qualified leads</span> with an AI-built scorecard
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Give every visitor a personalised score, tailored recommendations and a branded PDF report — and capture
              their details while you do it. Built by AI in minutes, refined by you.
            </p>
            <ul className="mt-7 space-y-3">
              {HERO_CHECKS.map((c) => (
                <li key={c} className="flex items-start gap-3 text-[15px] font-medium text-ink">
                  <Check />
                  {c}
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <CtaButtons loggedIn={loggedIn} />
            </div>
            {!loggedIn && <p className="mt-4 text-sm text-muted">Free to try — no card required.</p>}
          </div>
          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            <div className="absolute inset-0 -rotate-3 scale-95 rounded-3xl bg-gradient-to-br from-primary/15 to-navy/15" />
            <img
              src="/images/hero-report.png"
              alt="A personalised scorecard report with an overall score, scores by area and recommended next steps"
              className="relative w-full drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Proof strip */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-10 md:grid-cols-4">
          {PROOF_POINTS.map((p) => (
            <div key={p.stat} className="text-center md:text-left">
              <span className="text-2xl font-extrabold text-navy">{p.stat}</span>
              <p className="mt-1 text-sm leading-snug text-muted">{p.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature block 1 — AI Builder */}
      <section id="product" className="mx-auto max-w-6xl px-6 pt-24">
        <Reveal>
          <div className="grid items-center gap-14 md:grid-cols-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Build</span>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight text-navy md:text-4xl">
                From one sentence to a finished scorecard
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                Describe your business and what you want to measure. The AI Builder drafts the whole funnel — landing
                page, weighted questions, tiered results and a branded PDF report — ready to publish or polish.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Questions grouped into scoring areas that matter to your audience',
                  'Copy written for your industry, not generic filler',
                  'Change anything afterwards in the visual editor',
                ].map((c) => (
                  <li key={c} className="flex items-start gap-3 text-[15px] text-ink">
                    <Check />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <BuilderMockup />
          </div>
        </Reveal>
      </section>

      {/* Feature block 2 — Personalised results */}
      <section className="mx-auto max-w-6xl px-6 pt-24">
        <Reveal>
          <div className="grid items-center gap-14 md:grid-cols-2">
            <div className="order-1 md:order-none">
              <ResultsMockup />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Convert</span>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight text-navy md:text-4xl">
                Results people actually want to read
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                No two visitors see the same page. Scores, tier messaging, strengths and recommended next steps adapt
                to every set of answers — and a polished PDF report lands in their inbox seconds later.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Tiered results with tailored messaging per score band',
                  'Area-by-area breakdowns that show exactly where to improve',
                  'Downloadable, branded PDF report for every respondent',
                ].map((c) => (
                  <li key={c} className="flex items-start gap-3 text-[15px] text-ink">
                    <Check />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Feature block 3 — Lead capture */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="grid items-center gap-14 md:grid-cols-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Capture</span>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight text-navy md:text-4xl">
                Every answer becomes sales intelligence
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                Respondents share their details before results are revealed. You don&rsquo;t just get an email address —
                you get their score, their tier and every answer they gave, so your follow-up writes itself.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Lead form with your own custom fields',
                  'Scores and full answers stored against every lead',
                  'Automatic result emails with the PDF report attached',
                ].map((c) => (
                  <li key={c} className="flex items-start gap-3 text-[15px] text-ink">
                    <Check />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <LeadsMockup />
          </div>
        </Reveal>
      </section>

      {/* How it works — dark band */}
      <section id="how-it-works" className="bg-navy py-24 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">How it works</span>
              <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Live in three steps</h2>
            </div>
            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s.title} className="relative rounded-2xl border border-white/10 bg-white/5 p-8">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
                  <p className="mt-2.5 leading-relaxed text-white/70">{s.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Capability grid */}
      <section id="features" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Everything included</span>
              <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold leading-tight text-navy md:text-4xl">
                One platform for the whole scorecard funnel
              </h2>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {GRID_FEATURES.map((f) => (
                <div key={f.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card transition hover:-translate-y-1">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon>{f.icon}</Icon>
                  </div>
                  <h3 className="mt-4 font-bold text-navy">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-navy py-24 text-white">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <h2 className="text-3xl font-extrabold md:text-5xl">See your scorecard before your coffee&rsquo;s cold</h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/75">
              Describe your business, watch the AI Builder draft the whole thing, and start capturing leads today.
            </p>
            <div className="mt-9 flex justify-center">
              <CtaButtons loggedIn={loggedIn} light />
            </div>
            {!loggedIn && <p className="mt-4 text-sm text-white/60">Free to try — no card required.</p>}
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted sm:flex-row">
        <span>© {new Date().getFullYear()} Acceso AI</span>
        <a href="mailto:support@accesoai.com.au" className="hover:text-ink">
          support@accesoai.com.au
        </a>
      </footer>
    </main>
  );
}
