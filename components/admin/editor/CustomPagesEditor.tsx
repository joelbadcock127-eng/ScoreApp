'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CustomPage, ScorecardConfig } from '@/lib/types';
import { buildPreviewSrcdoc, sampleResultsData } from '@/lib/customPage';
import { ImagePicker } from '@/components/admin/editor/ui';

type PageKey = 'landing' | 'results';

const INPUT = 'mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary';
const LABEL = 'block text-xs font-semibold text-ink';

// Custom Design (AI): generate a fully custom HTML/CSS page for the landing
// and results pages, then edit every text and image through auto-built slot
// fields. The design shell and the content are stored separately, so editing
// copy never touches the design and a redesign never loses copy edits.
export default function CustomPagesEditor({ initialConfig }: { initialConfig: ScorecardConfig }) {
  const [cfg, setCfg] = useState<ScorecardConfig>(initialConfig);
  const [page, setPage] = useState<PageKey>('landing');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [instructions, setInstructions] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [mock, setMock] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const current: CustomPage | undefined = cfg.customPages?.[page];
  const mode = (page === 'landing' ? cfg.landingMode : cfg.resultsMode) ?? 'components';

  const previewData = useMemo(
    () => (page === 'results' ? sampleResultsData(cfg) : { scorecardTitle: cfg.title }),
    [cfg, page]
  );
  const srcdoc = useMemo(
    () => (current ? buildPreviewSrcdoc(current, previewData) : ''),
    [current, previewData]
  );

  function patch(p: Partial<ScorecardConfig>) {
    setCfg((c) => ({ ...c, ...p }));
    setDirty(true);
    setMessage('');
  }

  function setMode(newMode: 'components' | 'custom') {
    patch(page === 'landing' ? { landingMode: newMode } : { resultsMode: newMode });
  }

  function patchSlot(key: string, value: string) {
    if (!current) return;
    const updated: CustomPage = {
      ...current,
      slots: current.slots.map((s) => (s.key === key ? { ...s, value } : s)),
    };
    patch({ customPages: { ...cfg.customPages, [page]: updated } });
  }

  async function generate() {
    setGenerating(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/custom-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, instructions }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Generation failed.');
      setMock(Boolean(json.mock));
      setCfg((c) => ({
        ...c,
        customPages: { ...c.customPages, [page]: json.customPage },
        ...(page === 'landing' ? { landingMode: 'custom' as const } : { resultsMode: 'custom' as const }),
      }));
      setDirty(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed.');
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    setSaving(true);
    setError('');
    const res = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        landingMode: cfg.landingMode ?? 'components',
        resultsMode: cfg.resultsMode ?? 'components',
        customPages: cfg.customPages ?? {},
      }),
    });
    setSaving(false);
    if (res.ok) {
      setDirty(false);
      setMessage('Saved — the live page now uses this design.');
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error || 'Save failed.');
    }
  }

  const tabClass = (active: boolean) =>
    `rounded-md px-4 py-1.5 text-sm font-medium ${active ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'}`;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-gray-100">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-md border border-gray-200 hover:bg-gray-50"
            aria-label="Back to dashboard"
          >
            ‹
          </Link>
          <h1 className="text-lg font-bold">Custom Design</h1>
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button onClick={() => setPage('landing')} className={tabClass(page === 'landing')}>
              Landing page
            </button>
            <button onClick={() => setPage('results')} className={tabClass(page === 'results')}>
              Results page
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button onClick={() => setDevice('desktop')} className={tabClass(device === 'desktop')} title="Desktop preview">
              Desktop
            </button>
            <button onClick={() => setDevice('mobile')} className={tabClass(device === 'mobile')} title="Phone preview">
              Phone
            </button>
          </div>
          {message && <span className="text-sm text-green-600">{message}</span>}
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50"
          >
            {saving ? 'Saving…' : dirty ? 'Save' : 'Saved'}
          </button>
        </div>
      </div>

      {error && <p className="border-b border-red-100 bg-red-50 px-5 py-2.5 text-sm text-red-700">{error}</p>}
      {mock && (
        <p className="border-b border-amber-100 bg-amber-50 px-5 py-2.5 text-sm text-amber-800">
          Sample mode — no Claude API key configured, so this is a built-in sample design. Add ANTHROPIC_API_KEY for
          real AI designs.
        </p>
      )}

      <div className="flex min-h-0 flex-1">
        {/* Left rail */}
        <div className="w-[340px] flex-none overflow-y-auto border-r border-gray-200 bg-white p-5">
          {/* Mode */}
          <p className={LABEL}>This page is currently using</p>
          <div className="mt-2 flex rounded-lg bg-gray-100 p-1">
            <button onClick={() => setMode('components')} className={`flex-1 ${tabClass(mode === 'components')}`}>
              Standard editor
            </button>
            <button
              onClick={() => setMode('custom')}
              disabled={!current}
              className={`flex-1 ${tabClass(mode === 'custom')} disabled:opacity-40`}
            >
              Custom design
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">
            {mode === 'custom'
              ? 'Visitors see the AI-designed page below. Switch back any time — nothing is lost.'
              : current
                ? 'Visitors currently see the standard page. Switch to “Custom design” and save to go live with the design below.'
                : 'Generate a design to get started. The standard page keeps working until you switch.'}
          </p>

          {/* Generate */}
          <div className="mt-6 rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-semibold">{current ? 'Redesign with AI' : '✨ Design this page with AI'}</p>
            <p className="mt-1 text-xs text-muted">
              Uses your scorecard’s content and brand colours. Your text edits below survive a redesign.
            </p>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              placeholder="Optional design direction — e.g. dark and bold, lots of whitespace, warm and friendly…"
              className={INPUT}
            />
            <button
              onClick={generate}
              disabled={generating}
              className="mt-3 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60"
            >
              {generating ? 'Designing… (can take a minute)' : current ? 'Generate new design' : 'Generate design'}
            </button>
          </div>

          {/* Slot fields */}
          {current && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">Content</p>
              <p className="mt-1 text-xs text-muted">Every text and image in the design. Changes preview instantly.</p>
              <div className="mt-3 space-y-4">
                {current.slots.map((slot) =>
                  slot.type === 'image' ? (
                    <div key={slot.key}>
                      <ImagePicker label={slot.label} value={slot.value} onChange={(url) => patchSlot(slot.key, url)} />
                    </div>
                  ) : slot.type === 'rich' || slot.value.length > 90 ? (
                    <div key={slot.key}>
                      <label className={LABEL}>{slot.label}</label>
                      <textarea
                        value={slot.value}
                        onChange={(e) => patchSlot(slot.key, e.target.value)}
                        rows={3}
                        className={INPUT}
                      />
                    </div>
                  ) : (
                    <div key={slot.key}>
                      <label className={LABEL}>{slot.label}</label>
                      <input value={slot.value} onChange={(e) => patchSlot(slot.key, e.target.value)} className={INPUT} />
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="flex min-w-0 flex-1 items-start justify-center overflow-auto bg-gray-100 p-6">
          {current ? (
            <iframe
              title="Custom page preview"
              srcDoc={srcdoc}
              sandbox=""
              className={`h-full rounded-xl border border-gray-300 bg-white shadow-card transition-all ${
                device === 'mobile' ? 'w-[375px]' : 'w-full'
              }`}
            />
          ) : (
            <div className="mt-24 max-w-md text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                  <path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3Z" />
                  <path d="M18.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" />
                </svg>
              </div>
              <p className="mt-4 text-lg font-semibold">No custom design yet</p>
              <p className="mt-2 text-sm text-muted">
                The AI designs a completely custom {page === 'landing' ? 'landing' : 'results'} page from your
                scorecard’s content and brand — every word and image stays editable here, and{' '}
                {page === 'results' ? 'live scores, tier copy and charts flow through automatically' : 'the start button opens your normal lead form'}
                . It’s mobile-ready out of the box.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
