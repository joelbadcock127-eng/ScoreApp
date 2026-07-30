'use client';

import { useState } from 'react';

// Templates page: real, fully-built starting points. Using one creates a new
// scorecard and opens the builder.
const TEMPLATES: { name: string; blurb: string; tint: string; template?: string }[] = [
  {
    name: 'Club Pulse Survey',
    blurb:
      'The table tennis committee survey: custom-designed landing and thank-you pages, 12 questions on volunteers, admin, money and growth. No scores shown to respondents — their answers land in your inbox.',
    tint: 'from-rose-500 to-orange-400',
    template: 'club-survey',
  },
  {
    name: 'The AI Opportunity Assessment',
    blurb:
      'A copy of your flagship scored assessment exactly as it is today — 23 questions, tiered results pages and the PDF report — ready to rebrand for a new audience.',
    tint: 'from-primary/90 to-blue-400',
    template: 'ai-opportunity',
  },
];

export default function TemplatesGrid() {
  const [busy, setBusy] = useState(false);

  async function use(name: string, template?: string) {
    const n = prompt('Name your new scorecard', name);
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
