'use client';

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// The base-domain landing page: a short product pitch plus login / signup.
// Scorecards themselves live on their own subdomains and /s/<id> URLs.
export default function AuthLanding() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: mode, name, email, password }),
    });
    if (res.ok) {
      router.push('/account');
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error || 'That didn’t work — try again.');
      setBusy(false);
    }
  }

  const tabClass = (active: boolean) =>
    `flex-1 rounded-md py-2 text-sm font-medium transition ${
      active ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
    }`;

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-14 px-6 py-12 md:grid-cols-2">
        {/* Pitch */}
        <div>
          <img src="/images/logo.png" alt="Acceso AI" className="h-16 w-auto" />
          <h1 className="mt-8 text-4xl font-bold leading-tight md:text-5xl">
            Build scorecards that turn visitors into leads
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
            Create branded assessments with personalised results, PDF reports and lead capture — or let the AI Builder
            draft the whole scorecard from a short description of your business.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              'AI Builder drafts your questions, results and report in minutes',
              'Edit everything visually — landing page, questions, results, PDF',
              'Publish on your own domain and capture leads instantly',
            ].map((b) => (
              <li key={b} className="flex items-center gap-3 text-[15px]">
                <svg className="h-5 w-5 flex-none text-primary" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 11l4 4 10-11" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Auth card */}
        <form onSubmit={onSubmit} className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button type="button" onClick={() => setMode('login')} className={tabClass(mode === 'login')}>
              Log in
            </button>
            <button type="button" onClick={() => setMode('signup')} className={tabClass(mode === 'signup')}>
              Create account
            </button>
          </div>

          {mode === 'signup' && (
            <>
              <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-ink">Business name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your business"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-primary"
              />
            </>
          )}

          <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-ink">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourbusiness.com"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-primary"
          />

          <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-ink">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-primary"
          />

          {error && <p className="mt-4 text-sm text-tier-low">{error}</p>}

          <button
            disabled={busy}
            className="mt-6 w-full rounded-md bg-primary py-3 font-medium text-white hover:brightness-110 disabled:opacity-60"
          >
            {busy ? 'One moment…' : mode === 'login' ? 'Log in' : 'Create my account'}
          </button>
          <p className="mt-4 text-center text-xs text-muted">
            {mode === 'login' ? 'New here? Switch to “Create account” above.' : 'Free to try — no card required.'}
          </p>
        </form>
      </div>
    </main>
  );
}
