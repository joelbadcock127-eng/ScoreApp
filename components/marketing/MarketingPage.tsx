/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';

const FEATURES = [
  {
    title: 'AI Builder',
    body: 'Describe your business and your scorecard idea — Claude drafts the landing page, questions, results and PDF report in minutes.',
    icon: (
      <>
        <path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3Z" />
        <path d="M18.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" />
      </>
    ),
  },
  {
    title: 'Full visual editor',
    body: 'Edit every word, image and colour across the landing page, questions, results and PDF report — no code required.',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 13h8M8 16.5h5" />
      </>
    ),
  },
  {
    title: 'Personalised results & PDF reports',
    body: 'Every visitor gets a tailored result based on their answers, with a downloadable PDF report and instant lead capture.',
    icon: (
      <>
        <path d="M4 6h16v11H9l-4 3.5V6Z" />
        <path d="M8.5 10.5h7M8.5 13h4.5" />
      </>
    ),
  },
  {
    title: 'Your own domain',
    body: 'Publish on a managed subdomain or bring your own custom domain — each scorecard gets its own distinct URL.',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 3.8 6 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-6-3.8-9S9.5 5.7 12 3Z" />
      </>
    ),
  },
];

const STEPS = [
  { title: 'Describe your scorecard', body: 'Tell the AI Builder about your business, your audience and what the score should measure.' },
  { title: 'Review and refine', body: 'Get a complete draft in minutes, then fine-tune anything in the visual editor.' },
  { title: 'Publish and capture leads', body: 'Share your link and start collecting leads with personalised results and PDF reports.' },
];

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      {children}
    </svg>
  );
}

// The public homepage at the base domain: product pitch + Log in / Sign up
// (or a Dashboard button when already logged in). Scorecards themselves live
// on their own subdomains, /<slug> and /s/<id> URLs.
export default function MarketingPage({ loggedIn = false }: { loggedIn?: boolean }) {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <img src="/images/logo.png" alt="Acceso AI" className="h-9 w-auto" />
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <Link
              href="/account"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-4 py-2 text-sm font-medium text-ink hover:bg-gray-100">
                Log in
              </Link>
              <Link
                href="/login?mode=signup"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110"
              >
                Get started free
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-10 text-center md:pt-16">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          AI-powered scorecard builder
        </span>
        <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
          Turn visitors into leads with a scorecard built in minutes
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Create branded assessments with personalised results, PDF reports and instant lead capture — or describe your
          business and let the AI Builder draft the whole thing for you.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login?mode=signup"
            className="rounded-md bg-primary px-8 py-3 font-medium text-white hover:brightness-110"
          >
            Get started free
          </Link>
          <Link href="/login" className="rounded-md border border-gray-300 px-8 py-3 font-medium text-ink hover:bg-gray-50">
            Log in
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted">Free to try — no card required.</p>
      </section>

      {/* Feature grid */}
      <section className="border-t border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">Everything you need to launch a scorecard</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4 rounded-xl bg-white p-6 shadow-card">
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon>{f.icon}</Icon>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold">How it works</h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">
                {i + 1}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-gray-100 bg-navy py-20 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold">Ready to build your first scorecard?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Describe your business and get a complete, editable lead-generation scorecard in minutes.
          </p>
          <Link
            href="/login?mode=signup"
            className="mt-8 inline-block rounded-md bg-white px-8 py-3 font-medium text-navy hover:brightness-95"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-10 text-sm text-muted">
        <span>© {new Date().getFullYear()} Acceso AI</span>
        <a href="mailto:support@accesoai.com.au" className="hover:text-ink">
          support@accesoai.com.au
        </a>
      </footer>
    </main>
  );
}
