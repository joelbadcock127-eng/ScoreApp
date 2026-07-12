'use client';

import { useState } from 'react';
import { ScorecardEntry } from './AccountBar';

// "Go to Scorecards" page: every scorecard as a card with open/create actions.
export default function ScorecardsGrid({
  scorecards,
  activeId,
}: {
  scorecards: ScorecardEntry[];
  activeId: number;
}) {
  const [busy, setBusy] = useState(false);

  async function open(id: number) {
    setBusy(true);
    await fetch('/api/admin/scorecards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'activate', id }),
    });
    window.location.href = '/admin';
  }

  async function create() {
    const name = prompt('Name your new scorecard');
    if (!name?.trim()) return;
    setBusy(true);
    const res = await fetch('/api/admin/scorecards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', name: name.trim() }),
    });
    if (!res.ok) {
      setBusy(false);
      return alert('Could not create the scorecard.');
    }
    window.location.href = '/admin';
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Scorecards</h1>
        <button
          onClick={create}
          disabled={busy}
          className="rounded-md bg-primary px-5 py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-60"
        >
          ⊕ Create Scorecard
        </button>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {scorecards.map((sc) => (
          <div key={sc.id} className={`rounded-xl border bg-white p-5 ${sc.id === activeId ? 'border-primary' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-muted">
                {sc.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {sc.is_default ? 'Default' : 'Live'}
              </span>
            </div>
            <p className="mt-3 truncate text-lg font-semibold">{sc.name}</p>
            <p className="mt-0.5 text-xs text-muted">
              Updated {new Date(sc.updated_at).toLocaleDateString()}
              {sc.id === activeId && ' · currently editing'}
            </p>
            <button
              onClick={() => open(sc.id)}
              disabled={busy}
              className={`mt-4 w-full rounded-md py-2 text-sm font-medium disabled:opacity-60 ${
                sc.id === activeId
                  ? 'border border-gray-200 text-muted'
                  : 'bg-primary text-white hover:brightness-110'
              }`}
            >
              {sc.id === activeId ? 'Open' : 'Switch to this scorecard'}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted">
        The default scorecard is what visitors see on your public site. Switching scorecards changes which one you are
        editing and previewing — visitors keep seeing the default until multi-site publishing lands.
      </p>
    </div>
  );
}
