'use client';

import { useState } from 'react';
import { ScorecardMode, Tier } from '@/lib/types';

export default function ScoreTiersEditor({
  initialTiers,
  initialMode = 'scorecard',
}: {
  initialTiers: Tier[];
  initialMode?: ScorecardMode;
}) {
  const [tiers, setTiers] = useState<Tier[]>(initialTiers);
  const [mode, setMode] = useState<ScorecardMode>(initialMode);
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
      body: JSON.stringify({ tiers, mode }),
    });
    setSaving(false);
    setMessage(res.ok ? 'Saved.' : 'Save failed.');
  }

  const survey = mode === 'survey';

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold">Scoring</h1>

      <div className="mt-6 flex items-start justify-between gap-6 rounded-xl border border-gray-200 bg-white p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Survey mode</p>
          <p className="mt-2 text-muted">
            In survey mode respondents never see scores, tiers or the PDF report — after the questions they get a
            thank-you page, and you get their actual answers (in the lead’s Answers tab, in notification emails via
            the <code className="rounded bg-gray-50 px-1">{'{answers_summary}'}</code> merge field, and in the CSV
            export). Scores are still calculated for your own triage in the Leads dashboard.
          </p>
          {survey && (
            <p className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-sm text-ink">
              This scorecard runs as a survey. The tiers below only affect how <b>you</b> see responses in the admin.
              After switching, review your <b>Result Email</b> content: {'{score}'} renders empty and report
              buttons/links point to the results page instead of the (disabled) PDF report.
            </p>
          )}
        </div>
        <button
          role="switch"
          aria-checked={survey}
          aria-label="Survey mode"
          onClick={() => setMode(survey ? 'scorecard' : 'survey')}
          className={`relative mt-1 h-7 w-12 flex-none rounded-full transition ${survey ? 'bg-primary' : 'bg-gray-300'}`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${survey ? 'left-6' : 'left-1'}`}
          />
        </button>
      </div>

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
            className="rounded-md bg-primary px-8 py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-60"
          >
            Save
          </button>
          {message && <span className="text-sm text-muted">{message}</span>}
        </div>
      </div>
    </div>
  );
}
