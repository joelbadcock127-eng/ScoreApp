'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError('Incorrect password');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-card">
        <Image src="/images/logo.png" alt="Acceso AI" width={100} height={100} className="mx-auto h-20 w-auto" />
        <h1 className="mt-4 text-center text-xl font-semibold">Scorecard Admin</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mt-6 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-primary"
        />
        {error && <p className="mt-3 text-sm text-tier-low">{error}</p>}
        <button className="mt-5 w-full rounded-md bg-primary py-3 font-medium text-white hover:brightness-110">
          Log in
        </button>
      </form>
    </main>
  );
}
