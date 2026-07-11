'use client';

import { useState } from 'react';
import { Tier } from '@/lib/types';

export default function ScoreTiersEditor({ initialTiers }: { initialTiers: Tier[] }) {
  const [tiers, setTiers] = useState<Tier[]>(initialTiers);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  function update(i: number, patch: Partial<Tier>) {
    setTiers(tiers.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  }

  async function save() {
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tiers }),
    });
    setSaving(false);
    setMessage(res.ok ? 'Saved.' : 'Save failed.');
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold">Score Tiers</h1>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Score Tiers</p>
        <p className="mt-2 text-muted">
          Often when scores are displayed they’re colour coded using a traffic light style system.
          You can customise the tiers and colours.
        </p>

        <div className="mt-8 grid grid-cols-[64px,1fr,110px,110px,40px] items-center gap-4 text-xs font-semibold uppercase tracking-wide text-muted">
          <span>Colour</span>
          <span>Label</span>
          <span>Score %-from</span>
          <span>Score %-to</span>
          <span />
        </div>
        {tiers.map((t, i) => (
          <div key={i} className="mt-3 grid grid-cols-[64px,1fr,110px,110px,40px] items-center gap-4">
            <input
              type="color"
              value={t.color}
              onChange={(e) => update(i, { color: e.target.value })}
              className="h-10 w-14 cursor-pointer rounded border border-gray-300"
            />
            <input
              value={t.label}
              onChange={(e) => update(i, { label: e.target.value })}
              className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-primary"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={t.from}
              onChange={(e) => update(i, { from: Number(e.target.value) })}
              className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-primary"
            />
            <input
              type="number"
              min={0}
              max={100}
              value={t.to}
              onChange={(e) => update(i, { to: Number(e.target.value) })}
              className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-primary"
            />
            <button
              onClick={() => setTiers(tiers.filter((_, j) => j !== i))}
              className="text-muted hover:text-tier-low"
              aria-label="Remove tier"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          onClick={() =>
            setTiers([
              ...tiers,
              { key: `tier-${tiers.length + 1}`, label: 'New Tier', color: '#1c78fe', from: 0, to: 100 },
            ])
          }
          className="mt-5 text-sm font-medium text-primary hover:underline"
        >
          + Add Tier
        </button>

        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-md bg-primary px-8 py-2.5 font-medium text-white hover:bg-blue-600 disabled:opacity-60"
          >
            Save
          </button>
          {message && <span className="text-sm text-muted">{message}</span>}
        </div>
      </div>
    </div>
  );
}
