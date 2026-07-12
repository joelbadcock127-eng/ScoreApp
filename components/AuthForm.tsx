'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// The /login card: email + password log in or sign up. Used standalone (the
// marketing page links here) rather than inline on the homepage.
export default function AuthForm({ initialMode = 'login' }: { initialMode?: 'login' | 'signup' }) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <Link href="/" className="mb-8">
        <img src="/images/logo.png" alt="Acceso AI" className="h-14 w-auto" />
      </Link>

      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
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
          {mode === 'login' ? (
            <>
              New here?{' '}
              <button type="button" onClick={() => setMode('signup')} className="font-medium text-primary hover:underline">
                Create an account
              </button>
            </>
          ) : (
            'Free to try — no card required.'
          )}
        </p>
      </form>

      <Link href="/" className="mt-6 text-sm text-muted hover:text-ink">
        ← Back to the homepage
      </Link>
    </main>
  );
}
