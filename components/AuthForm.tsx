'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useState } from 'react';
import AiSparkleIcon from '@/components/AiSparkleIcon';

const LABEL = 'block text-[15px] font-semibold text-ink';
const FIELD =
  'mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-[15px] outline-none transition focus:border-primary';

// Split-screen login/signup: feature showcase on the left, clean form on the
// right (ScoreApp-style).
export default function AuthForm({ initialMode = 'login' }: { initialMode?: 'login' | 'signup' }) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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
      // Full navigation so the session + scorecard cookies apply before the
      // dashboard renders.
      window.location.assign('/account');
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error || 'That didn’t work — try again.');
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen">
      {/* Showcase panel */}
      <div className="relative hidden w-1/2 flex-col overflow-hidden bg-[#eef4fd] lg:flex">
        <Link href="/" className="absolute left-10 top-8">
          <img src="/images/logo.png" alt="Acceso AI" className="h-12 w-auto" />
        </Link>

        <div className="flex flex-1 flex-col items-center justify-center px-12 text-center">
          {/* Overlapping feature cards */}
          <div className="relative h-72 w-72">
            <div className="absolute inset-0 rounded-full bg-white/60" />
            <div className="absolute left-0 top-24 w-40 -rotate-6 rounded-xl border border-primary/30 bg-white p-2 shadow-card">
              <img src="/images/card-1.png" alt="" className="h-24 w-full rounded-lg object-cover" />
              <p className="py-2 text-sm font-medium text-navy">Marketing</p>
              <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white shadow">✓</span>
            </div>
            <div className="absolute right-0 top-2 w-40 rotate-3 rounded-xl border border-primary/30 bg-white p-2 shadow-card">
              <img src="/images/card-2.png" alt="" className="h-24 w-full rounded-lg object-cover" />
              <p className="py-2 text-sm font-medium text-navy">Finance</p>
              <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white shadow">✓</span>
            </div>
            <div className="absolute bottom-0 left-16 w-40 rotate-2 rounded-xl border border-primary/30 bg-white p-2 shadow-card">
              <img src="/images/card-3.png" alt="" className="h-24 w-full rounded-lg object-cover" />
              <p className="py-2 text-sm font-medium text-navy">Systems</p>
            </div>
          </div>

          <p className="mt-12 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-primary">
            <AiSparkleIcon className="h-4 w-4" /> New feature
          </p>
          <h2 className="mt-3 text-3xl font-bold text-navy md:text-4xl">AI-built scorecards</h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">
            Describe your business and the AI Builder drafts your whole scorecard — landing page, questions, results
            and PDF report. Then restyle it with completely custom AI-designed pages.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-24 xl:px-32">
        <Link href="/" className="mb-10 lg:hidden">
          <img src="/images/logo.png" alt="Acceso AI" className="h-12 w-auto" />
        </Link>

        <div className="mx-auto w-full max-w-md">
          <h1 className="text-4xl font-bold">{mode === 'login' ? 'Login' : 'Create account'}</h1>

          <form onSubmit={onSubmit} className="mt-10">
            {mode === 'signup' && (
              <div className="mb-6">
                <label className={LABEL}>Business name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your business" className={FIELD} />
              </div>
            )}

            <label className={LABEL}>
              Email<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className={FIELD}
            />

            <label className={`${LABEL} mt-6`}>
              Password<span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={FIELD}
            />

            {error && <p className="mt-4 text-sm text-tier-low">{error}</p>}

            <button
              disabled={busy}
              className="mt-8 w-full rounded-lg bg-primary py-3.5 text-[15px] font-medium text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {busy ? 'One moment…' : mode === 'login' ? 'Login' : 'Create my account'}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between text-[15px]">
            {mode === 'login' ? (
              <p className="text-ink">
                Don’t have an account?{' '}
                <button onClick={() => { setMode('signup'); setError(''); }} className="font-medium text-primary hover:underline">
                  Sign up?
                </button>
              </p>
            ) : (
              <p className="text-ink">
                Already have an account?{' '}
                <button onClick={() => { setMode('login'); setError(''); }} className="font-medium text-primary hover:underline">
                  Login
                </button>
              </p>
            )}
            <a href="mailto:support@accesoai.com.au?subject=Password%20reset" className="font-medium text-primary hover:underline">
              Forgot password?
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
