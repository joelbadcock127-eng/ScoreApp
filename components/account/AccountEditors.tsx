'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AccountSettings } from '@/lib/server/config';

const CARD = 'rounded-xl border border-gray-200 bg-white p-6';
const LABEL = 'text-xs font-semibold uppercase tracking-wide text-ink';
const HINT = 'mt-2 text-sm text-muted';
const INPUT = 'mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary';

type Role = AccountSettings['users'][number]['role'];
const ROLES: Role[] = ['owner', 'admin', 'editor', 'viewer'];

function useSaveAccount() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  async function save(body: AccountSettings) {
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/admin/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setMessage(res.ok ? 'Saved.' : 'Save failed.');
    if (res.ok) router.refresh();
  }
  return { save, saving, message };
}

function SaveRow({ onSave, saving, message }: { onSave: () => void; saving: boolean; message: string }) {
  return (
    <div className="mt-6 flex items-center gap-4 border-t border-gray-200 pt-5">
      <button
        onClick={onSave}
        disabled={saving}
        className="rounded-md bg-primary px-8 py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
      {message && <span className="text-sm text-muted">{message}</span>}
    </div>
  );
}

// ——— Account settings: business name + account email ————————————————
export function AccountSettingsEditor({ initial }: { initial: AccountSettings }) {
  const [v, setV] = useState(initial);
  const { save, saving, message } = useSaveAccount();
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold">Account settings</h1>
      <div className={`${CARD} mt-6`}>
        <p className={LABEL}>Business name</p>
        <input className={INPUT} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
        <p className={HINT}>Shown in the top bar and anywhere your account is referenced.</p>

        <p className={`${LABEL} mt-6`}>Account email</p>
        <input
          className={INPUT}
          type="email"
          value={v.email}
          placeholder="you@yourbusiness.com"
          onChange={(e) => setV({ ...v, email: e.target.value })}
        />
        <p className={HINT}>
          Used as this account&apos;s contact and default sending identity — each account sets its own here, no code
          changes needed.
        </p>
        <SaveRow onSave={() => save(v)} saving={saving} message={message} />
      </div>
    </div>
  );
}

// ——— Users and Permissions: editable team list ————————————————————————
export function UsersEditor({ initial }: { initial: AccountSettings }) {
  const [v, setV] = useState(initial);
  const { save, saving, message } = useSaveAccount();

  function patch(i: number, p: Partial<AccountSettings['users'][number]>) {
    setV({ ...v, users: v.users.map((u, j) => (j === i ? { ...u, ...p } : u)) });
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold">Users and Permissions</h1>
      <p className="mt-2 text-sm text-muted">
        Invite teammates and control what they can do. Owners manage billing, admins manage everything else, editors
        change content, viewers only see results.
      </p>

      <div className={`${CARD} mt-6 p-0`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-[11px] font-semibold uppercase tracking-widest text-muted">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="w-12 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {v.users.map((u, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-0">
                <td className="px-5 py-2.5">
                  <input
                    className="w-full rounded-md border border-transparent px-2 py-1.5 outline-none hover:border-gray-200 focus:border-primary"
                    value={u.name}
                    placeholder="Name"
                    onChange={(e) => patch(i, { name: e.target.value })}
                  />
                </td>
                <td className="px-5 py-2.5">
                  <input
                    className="w-full rounded-md border border-transparent px-2 py-1.5 outline-none hover:border-gray-200 focus:border-primary"
                    value={u.email}
                    type="email"
                    placeholder="teammate@example.com"
                    onChange={(e) => patch(i, { email: e.target.value })}
                  />
                </td>
                <td className="px-5 py-2.5">
                  <select
                    className="rounded-md border border-gray-200 px-2 py-1.5 text-sm capitalize outline-none focus:border-primary"
                    value={u.role}
                    onChange={(e) => patch(i, { role: e.target.value as Role })}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <button
                    onClick={() => setV({ ...v, users: v.users.filter((_, j) => j !== i) })}
                    className="rounded-md px-2 py-1 text-muted hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove user"
                    title="Remove user"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
            {!v.users.length && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted">
                  No users yet — add your first teammate below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3">
          <button
            onClick={() => setV({ ...v, users: [...v.users, { name: '', email: '', role: 'editor' }] })}
            className="text-sm font-medium text-primary hover:underline"
          >
            ⊕ Add user
          </button>
          <div className="flex items-center gap-4">
            {message && <span className="text-sm text-muted">{message}</span>}
            <button
              onClick={() => save(v)}
              disabled={saving}
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
