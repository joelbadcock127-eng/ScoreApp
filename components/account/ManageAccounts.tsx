'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';

// Table rows need a keyed fragment so an account row can expand to a second
// <tr> with its feature settings.
const FragmentRow = Fragment;

export interface AccountRow {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  scorecards: { id: number; name: string }[];
  features?: { custom_domain?: boolean; custom_design?: boolean; ai_limit?: number | null };
  ai_used?: number;
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

  const [featuresFor, setFeaturesFor] = useState<number | null>(null);

  async function saveFeatures(id: number, features: NonNullable<AccountRow['features']>) {
    if (await post({ action: 'set-features', id, features })) {
      setRows((r) => r.map((a) => (a.id === id ? { ...a, features } : a)));
    }
  }

  async function resetUsage(id: number) {
    if (await post({ action: 'reset-ai-usage', id })) {
      setRows((r) => r.map((a) => (a.id === id ? { ...a, ai_used: 0 } : a)));
    }
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
              <FragmentRow key={a.id}>
              <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
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
                  {a.role !== 'owner' && (
                    <button
                      onClick={() => setFeaturesFor(featuresFor === a.id ? null : a.id)}
                      disabled={busy}
                      className="font-medium text-primary hover:underline"
                    >
                      Features
                    </button>
                  )}
                  <button onClick={() => rename(a.id, a.name)} disabled={busy} className="ml-3 font-medium text-primary hover:underline">
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
              {featuresFor === a.id && (
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <td colSpan={5} className="px-5 py-4">
                    <FeaturesPanel
                      account={a}
                      busy={busy}
                      onSave={(f) => saveFeatures(a.id, f)}
                      onResetUsage={() => resetUsage(a.id)}
                    />
                  </td>
                </tr>
              )}
              </FragmentRow>
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

// Per-account feature limits: what appears in their dashboard, and how many
// AI generations they can run. Toggling something off simply removes it from
// their account.
function FeaturesPanel({
  account,
  busy,
  onSave,
  onResetUsage,
}: {
  account: AccountRow;
  busy: boolean;
  onSave: (f: NonNullable<AccountRow['features']>) => void;
  onResetUsage: () => void;
}) {
  const [customDomain, setCustomDomain] = useState(account.features?.custom_domain !== false);
  const [customDesign, setCustomDesign] = useState(account.features?.custom_design !== false);
  const [aiLimit, setAiLimit] = useState(account.features?.ai_limit == null ? '' : String(account.features.ai_limit));
  const used = account.ai_used ?? 0;

  return (
    <div className="flex flex-wrap items-end gap-6 text-sm">
      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={customDomain}
          onChange={(e) => setCustomDomain(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        <span>
          <span className="font-medium">Own domain</span>
          <span className="block text-xs text-muted">Can connect a domain they own</span>
        </span>
      </label>

      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={customDesign}
          onChange={(e) => setCustomDesign(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        <span>
          <span className="font-medium">Custom Design (AI)</span>
          <span className="block text-xs text-muted">AI page designer + chat editor</span>
        </span>
      </label>

      <div>
        <span className="block text-xs font-semibold text-ink">AI usage limit</span>
        <div className="mt-1 flex items-center gap-2">
          <input
            value={aiLimit}
            onChange={(e) => setAiLimit(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="Unlimited"
            className="w-24 rounded-md border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-primary"
          />
          <span className="text-xs text-muted">
            used {used}
            {aiLimit !== '' && ` / ${aiLimit}`}
          </span>
          {used > 0 && (
            <button onClick={onResetUsage} disabled={busy} className="text-xs font-medium text-primary hover:underline">
              reset
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-muted">Generations + chat edits. Empty = unlimited.</p>
      </div>

      <button
        onClick={() =>
          onSave({
            custom_domain: customDomain,
            custom_design: customDesign,
            ai_limit: aiLimit === '' ? null : Number(aiLimit),
          })
        }
        disabled={busy}
        className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60"
      >
        Save features
      </button>
    </div>
  );
}
