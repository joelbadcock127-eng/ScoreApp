'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CustomPage, ScorecardConfig } from '@/lib/types';
import { buildPreviewSrcdoc, sampleResultsData } from '@/lib/customPage';
import { ImagePicker } from '@/components/admin/editor/ui';
import AiSparkleIcon from '@/components/AiSparkleIcon';

type PageKey = 'landing' | 'results';

interface ChatMsg {
  role: 'user' | 'assistant';
  text: string;
  error?: boolean;
}

const INPUT = 'mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary';
const LABEL = 'block text-xs font-semibold text-ink';

// Custom Design (AI): generate a fully custom HTML/CSS page for the landing
// and results pages, edit every text/image through auto-built slot fields,
// and iterate on the design through the AI chat — with undo across every AI
// change. Design shell and content are stored separately, so copy edits
// survive redesigns.
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
  // AI chat + versions, kept per page.
  const [chat, setChat] = useState<Record<PageKey, ChatMsg[]>>({ landing: [], results: [] });
  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [history, setHistory] = useState<Record<PageKey, CustomPage[]>>({ landing: [], results: [] });
  const [future, setFuture] = useState<Record<PageKey, CustomPage[]>>({ landing: [], results: [] });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const current: CustomPage | undefined = cfg.customPages?.[page];
  const mode = (page === 'landing' ? cfg.landingMode : cfg.resultsMode) ?? 'components';

  const previewData = useMemo(
    () => (page === 'results' ? sampleResultsData(cfg) : { scorecardTitle: cfg.title }),
    [cfg, page]
  );
  const srcdoc = useMemo(
    () => (current ? buildPreviewSrcdoc(current, previewData, { editable: true }) : ''),
    [current, previewData]
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, chatBusy]);

  // Click-to-edit: the sandboxed preview posts the slot key of whatever was
  // clicked; scroll its field into view, focus it and flash it.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type !== 'cp-slot-click' || typeof e.data.key !== 'string') return;
      const field = document.getElementById(`cp-field-${e.data.key}`);
      if (!field) return;
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const input = field.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
      input?.focus({ preventScroll: true });
      field.classList.add('ring-2', 'ring-primary', 'rounded-lg');
      setTimeout(() => field.classList.remove('ring-2', 'ring-primary', 'rounded-lg'), 1600);
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

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

  // Every AI change (generate or chat edit) goes through here so undo works.
  function applyAiChange(newPage: CustomPage) {
    if (current) setHistory((h) => ({ ...h, [page]: [...h[page], current].slice(-20) }));
    setFuture((f) => ({ ...f, [page]: [] }));
    setCfg((c) => ({
      ...c,
      customPages: { ...c.customPages, [page]: newPage },
      ...(page === 'landing' ? { landingMode: 'custom' as const } : { resultsMode: 'custom' as const }),
    }));
    setDirty(true);
    setMessage('');
  }

  function undo() {
    const prev = history[page].at(-1);
    if (!prev || !current) return;
    setHistory((h) => ({ ...h, [page]: h[page].slice(0, -1) }));
    setFuture((f) => ({ ...f, [page]: [...f[page], current] }));
    patch({ customPages: { ...cfg.customPages, [page]: prev } });
  }

  function redo() {
    const next = future[page].at(-1);
    if (!next || !current) return;
    setFuture((f) => ({ ...f, [page]: f[page].slice(0, -1) }));
    setHistory((h) => ({ ...h, [page]: [...h[page], current] }));
    patch({ customPages: { ...cfg.customPages, [page]: next } });
  }

  async function generate() {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/admin/custom-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, instructions }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Generation failed.');
      setMock(Boolean(json.mock));
      applyAiChange(json.customPage);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed.');
    } finally {
      setGenerating(false);
    }
  }

  async function sendChat(e: React.FormEvent) {
    e.preventDefault();
    const instruction = chatInput.trim();
    if (!instruction || !current || chatBusy) return;
    setChat((c) => ({ ...c, [page]: [...c[page], { role: 'user', text: instruction }] }));
    setChatInput('');
    setChatBusy(true);
    try {
      const res = await fetch('/api/admin/custom-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, action: 'edit', instruction, customPage: current }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Edit failed.');
      setMock(Boolean(json.mock));
      applyAiChange(json.customPage);
      setChat((c) => ({ ...c, [page]: [...c[page], { role: 'assistant', text: json.changeSummary || 'Done.' }] }));
    } catch (err) {
      setChat((c) => ({
        ...c,
        [page]: [
          ...c[page],
          { role: 'assistant', text: err instanceof Error ? err.message : 'Edit failed.', error: true },
        ],
      }));
    } finally {
      setChatBusy(false);
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
      setMessage('Saved');
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
          <h1 className="flex items-center gap-2 text-lg font-bold">
            <AiSparkleIcon className="h-5 w-5" />
            Custom Design
          </h1>
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button onClick={() => setPage('landing')} className={tabClass(page === 'landing')}>
              Landing page
            </button>
            <button onClick={() => setPage('results')} className={tabClass(page === 'results')}>
              Results page
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Undo / redo across AI changes */}
          <div className="flex rounded-lg border border-gray-200 p-0.5">
            <button
              onClick={undo}
              disabled={!history[page].length}
              className="rounded-md px-2.5 py-1 text-sm hover:bg-gray-50 disabled:opacity-30"
              title="Undo AI change"
            >
              ↩
            </button>
            <button
              onClick={redo}
              disabled={!future[page].length}
              className="rounded-md px-2.5 py-1 text-sm hover:bg-gray-50 disabled:opacity-30"
              title="Redo"
            >
              ↪
            </button>
          </div>
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
          Sample mode — no Claude API key configured, so designs and chat edits are canned demos. Add
          ANTHROPIC_API_KEY for the real thing.
        </p>
      )}

      <div className="flex min-h-0 flex-1">
        {/* Left rail: mode, generate, content slots */}
        <div className="w-[320px] flex-none overflow-y-auto border-r border-gray-200 bg-white p-5">
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

          <div className="mt-6 rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-semibold">{current ? 'Redesign from scratch' : '✨ Design this page with AI'}</p>
            <p className="mt-1 text-xs text-muted">
              Uses your scorecard’s content and brand colours. Your text edits below survive a redesign; for tweaks to
              the current design, use the chat instead.
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

          {current && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">Content</p>
              <p className="mt-1 text-xs text-muted">
                Every text and image in the design — or just click anything in the preview to jump straight to its
                field. Changes preview instantly.
              </p>
              <div className="mt-3 space-y-4">
                {current.slots.map((slot) =>
                  slot.type === 'image' ? (
                    <div key={slot.key} id={`cp-field-${slot.key}`} className="transition-shadow">
                      <ImagePicker label={slot.label} value={slot.value} onChange={(url) => patchSlot(slot.key, url)} />
                    </div>
                  ) : slot.type === 'rich' || slot.value.length > 90 ? (
                    <div key={slot.key} id={`cp-field-${slot.key}`} className="transition-shadow">
                      <label className={LABEL}>{slot.label}</label>
                      <textarea
                        value={slot.value}
                        onChange={(e) => patchSlot(slot.key, e.target.value)}
                        rows={3}
                        className={INPUT}
                      />
                    </div>
                  ) : (
                    <div key={slot.key} id={`cp-field-${slot.key}`} className="transition-shadow">
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
              // allow-scripts only (opaque origin): the click-to-edit helper can
              // postMessage to us but can never reach the app, cookies or DOM.
              sandbox="allow-scripts"
              className={`h-full rounded-xl border border-gray-300 bg-white shadow-card transition-all ${
                device === 'mobile' ? 'w-[375px]' : 'w-full'
              }`}
            />
          ) : (
            <div className="mt-24 max-w-md text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-card">
                <AiSparkleIcon className="h-8 w-8" />
              </div>
              <p className="mt-4 text-lg font-semibold">No custom design yet</p>
              <p className="mt-2 text-sm text-muted">
                The AI designs a completely custom {page === 'landing' ? 'landing' : 'results'} page from your
                scorecard’s content and brand — every word and image stays editable here, and{' '}
                {page === 'results'
                  ? 'live scores, tier copy and charts flow through automatically'
                  : 'the start button opens your normal lead form'}
                . It’s mobile-ready out of the box.
              </p>
            </div>
          )}
        </div>

        {/* AI chat */}
        <div className="flex w-[300px] flex-none flex-col border-l border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold">AI design chat</p>
            <p className="mt-0.5 text-xs text-muted">Describe a change — colours, layout, new sections, wording…</p>
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            {!chat[page].length && (
              <div className="rounded-lg bg-gray-50 p-3 text-xs text-muted">
                {current
                  ? 'Try: “Make the hero darker and more dramatic” · “Add a testimonials section” · “Rounder buttons” · “Tighten the spacing on mobile”'
                  : 'Generate a design first, then chat here to refine it.'}
              </div>
            )}
            {chat[page].map((m, i) => (
              <div
                key={i}
                className={`max-w-[95%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'ml-auto bg-primary text-white'
                    : m.error
                      ? 'bg-red-50 text-red-700'
                      : 'bg-gray-100 text-ink'
                }`}
              >
                {m.text}
              </div>
            ))}
            {chatBusy && (
              <div className="flex w-fit items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm text-muted">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Making the change…
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendChat} className="border-t border-gray-100 p-3">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendChat(e);
                }
              }}
              rows={2}
              disabled={!current || chatBusy}
              placeholder={current ? 'What should change?' : 'Generate a design first'}
              className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary disabled:bg-gray-50"
            />
            <button
              disabled={!current || chatBusy || !chatInput.trim()}
              className="mt-2 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
