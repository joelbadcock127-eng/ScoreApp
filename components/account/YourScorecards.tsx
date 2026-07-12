'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// "Your Scorecards" table on the account dashboard: search, NAME / STATUS /
// VISITED columns, a ⋯ row menu and the Featured Template card.
export interface ScorecardRow {
  id: number;
  name: string;
  is_default: boolean;
  created_at: string;
  visited: number;
}

export default function YourScorecards({ rows, activeId }: { rows: ScorecardRow[]; activeId: number }) {
  const [query, setQuery] = useState('');
  const [menuFor, setMenuFor] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuFor(null);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const filtered = rows.filter((r) => r.name.toLowerCase().includes(query.trim().toLowerCase()));

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    const res = await fetch('/api/admin/scorecards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setBusy(false);
      const json = await res.json().catch(() => ({}));
      alert(json.error || 'That didn’t work.');
      return false;
    }
    return true;
  }

  async function edit(id: number) {
    if (await post({ action: 'activate', id })) window.location.href = '/admin';
  }
  async function makeLive(id: number) {
    if (await post({ action: 'set-default', id })) window.location.reload();
  }
  async function remove(id: number, name: string) {
    if (!confirm(`Delete “${name}”? Its leads stay but the scorecard is gone for good.`)) return;
    if (await post({ action: 'delete', id })) window.location.reload();
  }
  async function create(name?: string) {
    const n = name ?? prompt('Name your new scorecard');
    if (!n?.trim()) return;
    if (await post({ action: 'create', name: n.trim() })) window.location.href = '/admin';
  }

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Your Scorecards</h1>
        <button
          onClick={() => create()}
          disabled={busy}
          className="rounded-md bg-primary px-5 py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-60"
        >
          Create Scorecard
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-3.8-3.8" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <p className="flex-none text-sm text-muted">
          {filtered.length} scorecard{filtered.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="mt-4 overflow-visible rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-[11px] font-semibold uppercase tracking-widest text-muted">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Visited</th>
              <th className="w-12 px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
                <td className="px-5 py-3.5">
                  <button onClick={() => edit(r.id)} disabled={busy} className="text-left font-medium text-ink hover:text-primary">
                    {r.name}
                  </button>
                  <p className="mt-0.5 text-xs text-muted">
                    <a href={`/s/${r.id}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      /s/{r.id}
                    </a>
                    {' · '}Created {new Date(r.created_at).toLocaleDateString()}
                    {r.id === activeId && ' · currently editing'}
                  </p>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      r.is_default ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-muted'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${r.is_default ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {r.is_default ? 'Live' : 'Draft'}
                  </span>
                </td>
                <td className="px-5 py-3.5 tabular-nums">{r.visited.toLocaleString()}</td>
                <td className="relative px-5 py-3.5 text-right">
                  <button
                    onClick={() => setMenuFor(menuFor === r.id ? null : r.id)}
                    className="rounded-md px-2 py-1 text-lg leading-none text-muted hover:bg-gray-100"
                    aria-label={`Actions for ${r.name}`}
                  >
                    ⋯
                  </button>
                  {menuFor === r.id && (
                    <div
                      ref={menuRef}
                      className="absolute right-4 top-11 z-20 w-48 rounded-xl border border-gray-200 bg-white p-1.5 text-left shadow-card"
                    >
                      <button onClick={() => edit(r.id)} disabled={busy} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50">
                        Edit
                      </button>
                      <Link href={`/s/${r.id}`} target="_blank" className="block w-full rounded-md px-3 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuFor(null)}>
                        Preview
                      </Link>
                      {!r.is_default && (
                        <button onClick={() => makeLive(r.id)} disabled={busy} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50">
                          Make live
                        </button>
                      )}
                      {!r.is_default && (
                        <button
                          onClick={() => remove(r.id, r.name)}
                          disabled={busy}
                          className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-sm text-muted">
                  No scorecards match “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Featured template */}
      <div className="mt-8 flex flex-wrap items-center gap-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex h-24 w-36 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-primary/90 to-blue-400 text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
            <path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3Z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">Featured template</p>
          <p className="mt-1 text-lg font-semibold">Business Growth Scorecard</p>
          <p className="mt-0.5 text-sm text-muted">
            A ready-made assessment that scores leads across strategy, marketing and operations — customise every question and result page.
          </p>
        </div>
        <button
          onClick={() => create('Business Growth Scorecard')}
          disabled={busy}
          className="flex-none rounded-md border border-primary px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-60"
        >
          Use this template
        </button>
      </div>
    </div>
  );
}
