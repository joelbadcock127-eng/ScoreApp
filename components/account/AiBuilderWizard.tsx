'use client';

import { useState } from 'react';
import type { AiBrief, AiContent, AiGeneration, AiPdf, AiResults, AiStrategy } from '@/lib/ai/brief';
import { TONES } from '@/lib/ai/brief';
import AiSparkleIcon from '@/components/AiSparkleIcon';

const CARD = 'rounded-xl border border-gray-200 bg-white p-6';
const LABEL = 'block text-xs font-semibold uppercase tracking-wide text-ink';
const INPUT = 'mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary';
const HINT = 'mt-1.5 text-xs text-muted';

type Phase = 'brand' | 'describe' | 'generating' | 'review';

const GEN_STEPS = [
  { key: 'strategy', label: 'Planning categories, tiers and strategy' },
  { key: 'content', label: 'Writing the landing page and questions' },
  { key: 'results', label: 'Writing the results pages' },
  { key: 'pdf', label: 'Writing the PDF report' },
] as const;

export default function AiBuilderWizard() {
  const [phase, setPhase] = useState<Phase>('brand');
  const [brief, setBrief] = useState<AiBrief>({
    businessName: '',
    scorecardName: '',
    description: '',
    audience: '',
    outcome: '',
    cta: '',
    tone: 'Professional',
    categoriesCount: 4,
    questionsCount: 12,
    primaryColor: '#1c78fe',
    secondaryColor: '#152042',
    logoUrl: '',
  });
  const [genStep, setGenStep] = useState(0);
  const [generation, setGeneration] = useState<AiGeneration | null>(null);
  const [mock, setMock] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const patch = (p: Partial<AiBrief>) => setBrief((b) => ({ ...b, ...p }));

  async function post<T>(body: Record<string, unknown>): Promise<T> {
    const res = await fetch('/api/admin/ai-builder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Generation failed.');
    return json as T;
  }

  async function generate() {
    setPhase('generating');
    setError('');
    setGeneration(null);
    try {
      setGenStep(0);
      const s = await post<{ strategy: AiStrategy; mock?: boolean }>({ step: 'strategy', brief });
      setMock(Boolean(s.mock));
      setGenStep(1);
      const c = await post<{ content: AiContent }>({ step: 'content', brief, strategy: s.strategy });
      setGenStep(2);
      const r = await post<{ results: AiResults }>({ step: 'results', brief, strategy: s.strategy });
      setGenStep(3);
      const p = await post<{ pdf: AiPdf }>({ step: 'pdf', brief, strategy: s.strategy });
      setGenStep(4);
      setGeneration({ strategy: s.strategy, content: c.content, results: r.results, pdf: p.pdf });
      setPhase('review');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed.');
      setPhase('describe');
    }
  }

  async function save(destination: string) {
    if (!generation) return;
    setSaving(true);
    setError('');
    try {
      await post<{ ok: true; id: number }>({ step: 'save', brief, generation });
      // Full navigation (not a client-side push) so the "currently editing"
      // cookie set by the save is guaranteed to be in place before the editor
      // renders — the editor must open the NEW scorecard, never a fallback.
      window.location.assign(destination);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3">
        <AiSparkleIcon className="h-8 w-8" />
        <h1 className="text-3xl font-bold">AI Builder</h1>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
          Beta
        </span>
      </div>
      <p className="mt-2 text-sm text-muted">
        Creates a brand-new scorecard in your account: describe your business and idea, and the AI drafts the landing
        page copy, questions, results and PDF report. Everything opens in the normal editors afterwards — and you can
        restyle the landing and results pages any time in Build → Custom Design (AI).
      </p>

      {/* Step indicator */}
      <div className="mt-6 flex items-center gap-2 text-xs font-medium">
        {(['Brand', 'Describe', 'Generate', 'Review'] as const).map((label, i) => {
          const idx = phase === 'brand' ? 0 : phase === 'describe' ? 1 : phase === 'generating' ? 2 : 3;
          return (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && <span className="h-px w-6 bg-gray-300" />}
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  i <= idx ? 'bg-primary text-white' : 'bg-gray-200 text-muted'
                }`}
              >
                {i + 1}
              </span>
              <span className={i <= idx ? 'text-ink' : 'text-muted'}>{label}</span>
            </div>
          );
        })}
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {/* ——— Step 1: Brand ——— */}
      {phase === 'brand' && (
        <div className={`${CARD} mt-6`}>
          <label className={LABEL}>Business name</label>
          <input className={INPUT} value={brief.businessName} onChange={(e) => patch({ businessName: e.target.value })} placeholder="Acme Consulting" />

          <label className={`${LABEL} mt-5`}>Scorecard name</label>
          <input className={INPUT} value={brief.scorecardName} onChange={(e) => patch({ scorecardName: e.target.value })} placeholder="The Business Growth Scorecard" />
          <p className={HINT}>A working title — the AI can refine it.</p>

          <label className={`${LABEL} mt-5`}>Tone of voice</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => patch({ tone: t })}
                className={`rounded-full border px-4 py-1.5 text-sm ${
                  brief.tone === t ? 'border-primary bg-primary/10 font-medium text-primary' : 'border-gray-300 text-muted hover:border-gray-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className={LABEL}>Primary colour</label>
              <div className="mt-2 flex items-center gap-2">
                <input type="color" value={brief.primaryColor} onChange={(e) => patch({ primaryColor: e.target.value })} className="h-9 w-12 cursor-pointer rounded border border-gray-300" />
                <input className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary" value={brief.primaryColor} onChange={(e) => patch({ primaryColor: e.target.value })} />
              </div>
              <p className={HINT}>Buttons and highlights.</p>
            </div>
            <div>
              <label className={LABEL}>Secondary colour</label>
              <div className="mt-2 flex items-center gap-2">
                <input type="color" value={brief.secondaryColor} onChange={(e) => patch({ secondaryColor: e.target.value })} className="h-9 w-12 cursor-pointer rounded border border-gray-300" />
                <input className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary" value={brief.secondaryColor} onChange={(e) => patch({ secondaryColor: e.target.value })} />
              </div>
              <p className={HINT}>Dark panels and footer.</p>
            </div>
          </div>

          <label className={`${LABEL} mt-5`}>Logo URL (optional)</label>
          <input className={INPUT} value={brief.logoUrl ?? ''} onChange={(e) => patch({ logoUrl: e.target.value })} placeholder="https://…/logo.png" />
          <p className={HINT}>You can also upload one later in Settings → Branding.</p>

          <div className="mt-6 flex justify-end border-t border-gray-200 pt-5">
            <button
              onClick={() => setPhase('describe')}
              disabled={!brief.businessName.trim()}
              className="rounded-md bg-primary px-8 py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-50"
            >
              Next: describe your scorecard
            </button>
          </div>
        </div>
      )}

      {/* ——— Step 2: Describe ——— */}
      {phase === 'describe' && (
        <div className={`${CARD} mt-6`}>
          <label className={LABEL}>What should this scorecard do?</label>
          <textarea
            className={`${INPUT} min-h-28`}
            rows={4}
            value={brief.description}
            onChange={(e) => patch({ description: e.target.value })}
            placeholder="e.g. Help small trades businesses see how ready they are to win bigger commercial contracts, and position us as the experts who can get them there."
          />

          <label className={`${LABEL} mt-5`}>Who will take it?</label>
          <input className={INPUT} value={brief.audience} onChange={(e) => patch({ audience: e.target.value })} placeholder="e.g. Owners of trades businesses with 2–20 staff" />

          <label className={`${LABEL} mt-5`}>What should the score measure?</label>
          <input className={INPUT} value={brief.outcome} onChange={(e) => patch({ outcome: e.target.value })} placeholder="e.g. Readiness to win commercial contracts — higher is more ready" />

          <label className={`${LABEL} mt-5`}>Call to action after the results</label>
          <input className={INPUT} value={brief.cta} onChange={(e) => patch({ cta: e.target.value })} placeholder="e.g. Book a free 30-minute strategy call" />

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className={LABEL}>Scoring categories: {brief.categoriesCount}</label>
              <input type="range" min={2} max={6} value={brief.categoriesCount} onChange={(e) => patch({ categoriesCount: Number(e.target.value) })} className="mt-3 w-full accent-primary" />
              <p className={HINT}>Areas the score is broken into.</p>
            </div>
            <div>
              <label className={LABEL}>Questions: about {brief.questionsCount}</label>
              <input type="range" min={4} max={30} value={brief.questionsCount} onChange={(e) => patch({ questionsCount: Number(e.target.value) })} className="mt-3 w-full accent-primary" />
              <p className={HINT}>8–15 keeps completion rates high.</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-5">
            <button onClick={() => setPhase('brand')} className="text-sm font-medium text-muted hover:text-ink">
              ← Back
            </button>
            <button
              onClick={generate}
              disabled={!brief.description.trim()}
              className="rounded-md bg-primary px-8 py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-50"
            >
              ✨ Generate my scorecard
            </button>
          </div>
        </div>
      )}

      {/* ——— Step 3: Generating ——— */}
      {phase === 'generating' && (
        <div className={`${CARD} mt-6`}>
          <p className="text-lg font-semibold">Building “{brief.scorecardName || brief.businessName}”…</p>
          <p className="mt-1 text-sm text-muted">This usually takes under a minute. Keep this tab open.</p>
          <ul className="mt-6 space-y-3">
            {GEN_STEPS.map((s, i) => (
              <li key={s.key} className="flex items-center gap-3 text-sm">
                {i < genStep ? (
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-green-100 text-green-600">✓</span>
                ) : i === genStep ? (
                  <span className="h-6 w-6 flex-none animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <span className="h-6 w-6 flex-none rounded-full border-2 border-gray-200" />
                )}
                <span className={i <= genStep ? 'text-ink' : 'text-muted'}>{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ——— Step 4: Review ——— */}
      {phase === 'review' && generation && (
        <ReviewScreen
          generation={generation}
          mock={mock}
          saving={saving}
          onRegenerate={generate}
          onBack={() => setPhase('describe')}
          onSave={save}
        />
      )}
    </div>
  );
}

function ReviewScreen({
  generation: g,
  mock,
  saving,
  onRegenerate,
  onBack,
  onSave,
}: {
  generation: AiGeneration;
  mock: boolean;
  saving: boolean;
  onRegenerate: () => void;
  onBack: () => void;
  onSave: (destination: string) => void;
}) {
  const [openCat, setOpenCat] = useState<string | null>(g.strategy.categories[0]?.key ?? null);
  return (
    <div className="mt-6 space-y-5">
      {mock && (
        <p className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Sample mode: no Claude API key is configured (or AI_BUILDER_MOCK is on), so this is placeholder content
          showing how the builder works. Add <code className="font-mono">ANTHROPIC_API_KEY</code> to enable real
          generation.
        </p>
      )}

      <div className={CARD}>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Landing page</p>
        <h2 className="mt-2 text-2xl font-bold">{g.content.landing.heroTitle}</h2>
        <p className="mt-1 text-muted">{g.content.landing.heroSubtitle}</p>
        <p className="mt-3 text-sm leading-relaxed">{g.content.landing.heroBody}</p>
        <ul className="mt-3 space-y-1 text-sm">
          {g.content.landing.heroBullets.map((b, i) => (
            <li key={i}>✓ {b}</li>
          ))}
        </ul>
      </div>

      <div className={CARD}>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
          {g.strategy.categories.length} categories · {g.content.questions.length} questions
        </p>
        <div className="mt-3 space-y-2">
          {g.strategy.categories.map((c) => {
            const qs = g.content.questions.filter((q) => q.categoryKey === c.key);
            const open = openCat === c.key;
            return (
              <div key={c.key} className="rounded-lg border border-gray-200">
                <button
                  onClick={() => setOpenCat(open ? null : c.key)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-gray-50"
                >
                  <span>
                    {c.label} <span className="ml-2 font-normal text-muted">{qs.length} questions</span>
                  </span>
                  <span className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
                </button>
                {open && (
                  <ol className="space-y-2 border-t border-gray-100 px-4 py-3 text-sm text-muted">
                    {qs.map((q) => (
                      <li key={q.id} className="flex gap-2">
                        <span className="flex-none font-medium text-ink">{q.id.replace('q', '')}.</span>
                        <span>
                          {q.text}
                          <span className="mt-0.5 block text-xs">
                            1 = {q.labels.left} · 3 = {q.labels.center} · 5 = {q.labels.right}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={CARD}>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Result tiers</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {g.results.tierIntros.map((t) => (
            <div key={t.tier} className="rounded-lg border border-gray-200 p-4">
              <p className={`text-[11px] font-semibold uppercase tracking-wide ${t.tier === 'low' ? 'text-tier-low' : t.tier === 'medium' ? 'text-amber-600' : 'text-green-600'}`}>
                {g.strategy.tiers.find((x) => x.key === t.tier)?.label ?? t.tier}
              </p>
              <p className="mt-1.5 text-sm font-semibold">{t.headline}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{t.body[0]}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">
          Plus {g.results.categoryTexts.length} per-category result texts and {g.pdf.categories.length} PDF report
          sections — all editable after saving.
        </p>
      </div>

      <div className={`${CARD} flex flex-wrap items-center gap-3`}>
        <button
          onClick={() => onSave('/admin/build/landing')}
          disabled={saving}
          className="rounded-md bg-primary px-7 py-2.5 font-medium text-white hover:brightness-110 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save & open in the editor'}
        </button>
        <button
          onClick={() => onSave('/account/scorecards')}
          disabled={saving}
          className="rounded-md border border-primary px-6 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-60"
        >
          Save & back to Scorecards
        </button>
        <button onClick={onRegenerate} disabled={saving} className="px-3 py-2.5 text-sm font-medium text-muted hover:text-ink">
          ↻ Generate again
        </button>
        <button onClick={onBack} disabled={saving} className="px-3 py-2.5 text-sm font-medium text-muted hover:text-ink">
          Edit the brief
        </button>
      </div>
    </div>
  );
}
