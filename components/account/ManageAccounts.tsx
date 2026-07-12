'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface AccountRow {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  scorecards: { id: number; name: string }[];
}

const CARD = 'rounded-xl border border-gray-200 bg-white';
const INPUT = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary';

// Owner-only: create/manage the other accounts on this install.
export default function ManageAccounts({ initial, ownerId }: { initial: AccountRow[]; ownerId: number }) {
  const [rows, setRows] = useState(initial);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function post(body: Record<string, unknown>): Promise<boolean> {
    setBusy(true);
    setError('');
    const res = await fetch('/api/admin/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || 'That didn’t work.');
      return false;
    }
    return true;
  }

  async function refresh() {
    const res = await fetch('/api/admin/accounts');
    if (res.ok) setRows((await res.json()).accounts);
    router.refresh();
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (await post({ action: 'create', name, email, password })) {
      setName('');
      setEmail('');
      setPassword('');
      await refresh();
    }
  }

  async function resetPassword(id: number, accountName: string) {
    const password = prompt(`New password for ${accountName} (min 6 characters)`);
    if (!password) return;
    if (await post({ action: 'reset-password', id, password })) alert('Password updated.');
  }

  async function rename(id: number, current: string) {
    const newName = prompt('Account name', current);
    if (!newName?.trim() || newName === current) return;
    if (await post({ action: 'rename', id, name: newName.trim() })) await refresh();
  }

  async function remove(id: number, accountName: string) {
    if (!confirm(`Delete “${accountName}”? Their scorecards move to your account.`)) return;
    if (await post({ action: 'delete', id })) await refresh();
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold">Manage accounts</h1>
      <p className="mt-2 text-sm text-muted">
        Everyone here can log in with their email and password and build their own scorecards. Only you (the owner) can
        see this page.
      </p>

      <div className={`${CARD} mt-6 overflow-visible`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-[11px] font-semibold uppercase tracking-widest text-muted">
              <th className="px-5 py-3">Account</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Scorecards</th>
              <th className="px-5 py-3">Role</th>
              <th className="w-52 px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
                <td className="px-5 py-3.5">
                  <p className="font-medium">{a.name}</p>
                  <p className="mt-0.5 text-xs text-muted">Created {new Date(a.created_at).toLocaleDateString()}</p>
                </td>
                <td className="px-5 py-3.5">{a.email}</td>
                <td className="px-5 py-3.5">
                  {a.scorecards.length ? (
                    <span title={a.scorecards.map((s) => s.name).join(', ')}>
                      {a.scorecards.length} · {a.scorecards[0].name}
                      {a.scorecards.length > 1 ? '…' : ''}
                    </span>
                  ) : (
                    <span className="text-muted">None yet</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      a.role === 'owner' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-muted'
                    }`}
                  >
                    {a.role === 'owner' ? 'Owner' : 'Member'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right text-xs">
                  <button onClick={() => rename(a.id, a.name)} disabled={busy} className="font-medium text-primary hover:underline">
                    Rename
                  </button>
                  <button onClick={() => resetPassword(a.id, a.name)} disabled={busy} className="ml-3 font-medium text-primary hover:underline">
                    Reset password
                  </button>
                  {a.id !== ownerId && a.role !== 'owner' && (
                    <button onClick={() => remove(a.id, a.name)} disabled={busy} className="ml-3 font-medium text-red-600 hover:underline">
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={create} className={`${CARD} mt-8 p-6`}>
        <p className="text-sm font-semibold">Add an account</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink">Business name</label>
            <input className={`${INPUT} mt-2`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Their business" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink">Email</label>
            <input className={`${INPUT} mt-2`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="them@business.com" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink">Password</label>
            <input className={`${INPUT} mt-2`} type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-tier-low">{error}</p>}
        <button
          disabled={busy}
          className="mt-5 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60"
        >
          {busy ? 'Working…' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
