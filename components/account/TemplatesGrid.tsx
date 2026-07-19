'use client';

import { useState } from 'react';

// Templates page: a small gallery of starting points. Using one creates a new
// scorecard and opens the builder. Entries with a `template` key create a
// fully-built structure (questions, landing page, emails); the rest start blank.
const TEMPLATES: { name: string; blurb: string; tint: string; template?: string }[] = [
  {
    name: 'Sports Club Pulse Survey',
    blurb:
      'A ready-to-send survey for club committees: volunteer load, admin, money and growth. No scores shown — respondents get a thank-you page, you get their answers.',
    tint: 'from-rose-500 to-orange-400',
    template: 'club-survey',
  },
  {
    name: 'Business Growth Scorecard',
    blurb: 'Score leads across strategy, marketing and operations.',
    tint: 'from-primary/90 to-blue-400',
  },
  {
    name: 'Marketing Health Check',
    blurb: 'Benchmark channels, content and conversion in 3 minutes.',
    tint: 'from-emerald-500 to-teal-400',
  },
  {
    name: 'Leadership Readiness Quiz',
    blurb: 'Assess delegation, vision and team-building skills.',
    tint: 'from-violet-500 to-fuchsia-400',
  },
  {
    name: 'Financial Fitness Test',
    blurb: 'Reveal cashflow, pricing and profitability blind spots.',
    tint: 'from-amber-500 to-orange-400',
  },
  {
    name: 'Website Effectiveness Audit',
    blurb: 'Score design, speed, SEO and lead capture.',
    tint: 'from-sky-500 to-cyan-400',
  },
  {
    name: 'Blank Scorecard',
    blurb: 'Start from scratch with the full editor.',
    tint: 'from-gray-500 to-gray-400',
  },
];

export default function TemplatesGrid() {
  const [busy, setBusy] = useState(false);

  async function use(name: string, template?: string) {
    const n = prompt('Name your new scorecard', name === 'Blank Scorecard' ? '' : name);
    if (!n?.trim()) return;
    setBusy(true);
    const res = await fetch('/api/admin/scorecards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', name: n.trim(), template }),
    });
    if (!res.ok) {
      setBusy(false);
      return alert('Could not create the scorecard.');
    }
    window.location.href = '/admin';
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-bold">Templates</h1>
      <p className="mt-2 text-sm text-muted">
        Start from a proven structure — every template opens in the builder fully editable.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => (
          <div key={t.name} className="flex flex-col rounded-xl border border-gray-200 bg-white p-5">
            <div className={`flex h-28 items-center justify-center rounded-lg bg-gradient-to-br ${t.tint} text-white`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-9 w-9">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M3 9h18M8 13h8M8 16.5h5" />
              </svg>
            </div>
            <p className="mt-4 font-semibold">{t.name}</p>
            <p className="mt-1 flex-1 text-sm text-muted">{t.blurb}</p>
            <button
              onClick={() => use(t.name, t.template)}
              disabled={busy}
              className="mt-4 rounded-md border border-primary py-2 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-60"
            >
              Use template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
