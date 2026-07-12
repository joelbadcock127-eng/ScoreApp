'use client';

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResultsPageConfig, ResultsSectionKey, ScorecardConfig } from '@/lib/types';
import { tierFor } from '@/lib/scoring';
import SpeedChart from '@/components/SpeedChart';
import {
  ActionField,
  ColorField,
  EyeIcon,
  FieldLabel,
  FieldRow,
  RailButton,
  RichText,
  SelectInput,
  TextInput,
  Toggle,
  TrashIcon,
} from './ui';
import ThemePanel from './ThemePanel';
import TopBar from './TopBar';

type Rail = 'sections' | 'theme' | 'page';
type SectionKey = 'header' | 'changeDetails' | ResultsSectionKey | 'footer';
type Selection = { section: SectionKey; child?: string };

const SECTION_LABELS: Record<SectionKey, string> = {
  header: 'Header',
  changeDetails: 'Change Details Form Popup',
  speedChart: 'Speed Chart',
  categoryScores: 'Category Scores',
  cta: 'Call to Action',
  share: 'Share with Friends',
  footer: 'Footer',
};

const DEFAULT_RESULTS_PAGE: ResultsPageConfig = {
  order: ['speedChart', 'categoryScores', 'cta', 'share'],
  hidden: [],
  speedChart: { chartPosition: 'right', showOverall: true, scoreFormat: 'percent', showTiers: true },
  categories: { itemsPerRow: 2, showScores: true, showTier: true },
  share: { facebook: true, twitter: true, linkedin: true, background: '#152042', linksColor: '#ffffff' },
};

// ScoreApp-style results editor with draggable/hideable/deletable sections and
// per-tier "dynamic content" editing (Low / Medium / High copy variants).
export default function ResultsEditor({ initialConfig }: { initialConfig: ScorecardConfig }) {
  const router = useRouter();
  const [config, setConfig] = useState<ScorecardConfig>({
    ...initialConfig,
    resultsPage: initialConfig.resultsPage ?? DEFAULT_RESULTS_PAGE,
  });
  const [rail, setRail] = useState<Rail>('sections');
  const [sel, setSel] = useState<Selection>({ section: 'speedChart' });
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const sortedTiers = useMemo(
    () => [...config.tiers].sort((a, b) => a.from - b.from),
    [config.tiers]
  );
  const [editTierKey, setEditTierKey] = useState(sortedTiers[0]?.key ?? 'low');

  const page = config.resultsPage!;
  const r = config.results;
  const editTier = config.tiers.find((t) => t.key === editTierKey) ?? config.tiers[0];

  // Sample data for the preview: overall score sits in the middle of the tier
  // being edited; category scores vary a little around it (clamped into tier).
  const sample = useMemo(() => {
    const mid = Math.round((editTier.from + editTier.to) / 2);
    const clamp = (v: number) => Math.max(editTier.from, Math.min(editTier.to, v));
    return {
      overall: mid,
      categories: config.categories.map((c, i) => ({
        key: c.key,
        label: c.label,
        percent: clamp(mid + [-3, 3, -6, 8][i % 4]),
      })),
    };
  }, [editTier, config.categories]);

  function patch(p: Partial<ScorecardConfig>) {
    setConfig((c) => ({ ...c, ...p }));
    setDirty(true);
  }
  function patchPage(p: Partial<ResultsPageConfig>) {
    patch({ resultsPage: { ...page, ...p } });
  }
  function patchResults(p: Partial<ScorecardConfig['results']>) {
    patch({ results: { ...r, ...p } });
  }
  function patchTierIntro(p: Partial<{ headline: string; body: string[] }>) {
    patchResults({
      tierIntros: { ...r.tierIntros, [editTierKey]: { ...(r.tierIntros[editTierKey] ?? { headline: '', body: [] }), ...p } },
    });
  }
  function patchCategoryText(catKey: string, html: string) {
    patchResults({
      categoryTexts: {
        ...r.categoryTexts,
        [catKey]: { ...(r.categoryTexts[catKey] ?? {}), [editTierKey]: html },
      },
    });
  }
  function patchCta(p: Partial<ScorecardConfig['results']['cta']>) {
    patchResults({ cta: { ...r.cta, ...p } });
  }

  const isHidden = (k: SectionKey) => page.hidden.includes(k);
  function toggleHidden(k: SectionKey) {
    patchPage({ hidden: isHidden(k) ? page.hidden.filter((x) => x !== k) : [...page.hidden, k] });
  }
  function removeSection(k: ResultsSectionKey) {
    if (!confirm(`Delete the ${SECTION_LABELS[k]} section? You can re-add it with “Add Section”.`)) return;
    patchPage({ order: page.order.filter((x) => x !== k) });
    setSel({ section: 'header' });
  }
  function moveSection(from: number, to: number) {
    if (to < 0 || to >= page.order.length || from === to) return;
    const order = [...page.order];
    const [item] = order.splice(from, 1);
    order.splice(to, 0, item);
    patchPage({ order });
  }
  const removedSections = (['speedChart', 'categoryScores', 'cta', 'share'] as ResultsSectionKey[]).filter(
    (k) => !page.order.includes(k)
  );

  async function save() {
    setSaving(true);
    const res = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: config.title,
        copyright: config.copyright,
        branding: config.branding,
        results: config.results,
        resultsPage: config.resultsPage,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setDirty(false);
      router.refresh();
    } else {
      alert('Save failed.');
    }
  }

  const outline = (k: SectionKey, child?: string) =>
    `cursor-pointer transition ${
      rail === 'sections' && sel.section === k && sel.child === child
        ? 'outline outline-2 outline-primary'
        : 'outline outline-1 outline-transparent hover:outline-primary/40'
    }`;

  function select(section: SectionKey, child?: string) {
    setSel({ section, child });
    if (rail !== 'sections') setRail('sections');
  }

  // Tier picker used in the LOGIC blocks ("You are currently editing").
  function TierPicker() {
    return (
      <>
        <FieldRow label="Dynamic content">
          <Toggle on onChange={() => alert('Dynamic content keeps a copy of this text per score tier.')} label="Dynamic content" />
        </FieldRow>
        <p className="mt-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-muted">
          You are currently editing
        </p>
        <div className="relative mt-1">
          <span
            className="pointer-events-none absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: editTier.color }}
          />
          <SelectInput
            className="!pl-8"
            value={editTierKey}
            onChange={(e) => setEditTierKey(e.target.value)}
          >
            {sortedTiers.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label} content
              </option>
            ))}
          </SelectInput>
        </div>
      </>
    );
  }

  const gridCols = page.categories.itemsPerRow === 1 || device === 'mobile' ? '' : 'md:grid-cols-2';
  const chartLeft = page.speedChart.chartPosition === 'left';

  function renderSection(k: ResultsSectionKey) {
    if (isHidden(k)) return null;
    if (k === 'speedChart') {
      return (
        <section
          key={k}
          onClick={() => select('speedChart')}
          className={`mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 ${device === 'mobile' ? '' : 'md:grid-cols-2'} ${outline('speedChart')}`}
        >
          <div className={chartLeft && device !== 'mobile' ? 'md:order-2' : ''}>
            <div className="text-3xl font-medium leading-snug">
              <RichText value={r.thanksPrefix} onChange={(v) => patchResults({ thanksPrefix: v })} />
              <p className="font-bold">{config.title}</p>
            </div>
            <RichText
              value={r.tierIntros[editTierKey]?.headline ?? ''}
              onChange={(v) => patchTierIntro({ headline: v })}
              className="mt-7 text-lg leading-relaxed"
            />
            {(r.tierIntros[editTierKey]?.body ?? []).map((p, i) => (
              <div key={i} className="group relative">
                <RichText
                  value={p}
                  onChange={(v) =>
                    patchTierIntro({ body: (r.tierIntros[editTierKey]?.body ?? []).map((x, j) => (j === i ? v : x)) })
                  }
                  className="mt-5 text-lg leading-relaxed text-muted"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    patchTierIntro({ body: (r.tierIntros[editTierKey]?.body ?? []).filter((_, j) => j !== i) });
                  }}
                  className="absolute -right-6 top-1 hidden text-muted hover:text-tier-low group-hover:block"
                  aria-label="Remove paragraph"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
            <button
              onClick={(e) => {
                e.stopPropagation();
                patchTierIntro({ body: [...(r.tierIntros[editTierKey]?.body ?? []), 'New paragraph'] });
              }}
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              + Add paragraph
            </button>
            <div className="mt-5 flex flex-wrap items-baseline gap-x-1.5 text-lg leading-relaxed text-muted">
              <RichText value={r.emailedNote} onChange={(v) => patchResults({ emailedNote: v })} className="inline-block" />
              <span>john.smith@example.com -</span>
              <span className="text-primary underline">
                <RichText value={r.changeEmailLabel} onChange={(v) => patchResults({ changeEmailLabel: v })} className="inline-block" />
              </span>
            </div>
          </div>
          <div className={`rounded-2xl bg-white p-8 shadow-card ${chartLeft && device !== 'mobile' ? 'md:order-1' : ''}`}>
            <SpeedChart percent={sample.overall} tiers={config.tiers} />
            {page.speedChart.showOverall && (
              <>
                <RichText
                  value={r.overallHeading}
                  onChange={(v) => patchResults({ overallHeading: v })}
                  className="mt-4 text-center text-2xl font-bold"
                />
                <p className="text-center text-6xl font-bold" style={{ color: editTier.color }}>
                  {page.speedChart.scoreFormat === 'percent' ? `${sample.overall}%` : `${sample.overall}/100`}
                </p>
              </>
            )}
            {page.speedChart.showTiers && (
              <div className="mt-6 flex items-center justify-center gap-6">
                {sortedTiers.map((t) => (
                  <span key={t.key} className="flex items-center gap-2 text-base">
                    <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }
    if (k === 'categoryScores') {
      return (
        <section key={k} onClick={() => select('categoryScores')} className={`mx-auto max-w-6xl px-6 py-10 ${outline('categoryScores')}`}>
          <RichText
            value={r.categoryHeading}
            onChange={(v) => patchResults({ categoryHeading: v })}
            className="text-center text-3xl font-bold md:text-4xl"
          />
          <div className="mx-auto mt-5 max-w-4xl text-center text-lg leading-relaxed text-muted">
            {r.categorySub.map((s, i) => (
              <RichText
                key={i}
                value={s}
                onChange={(v) => patchResults({ categorySub: r.categorySub.map((x, j) => (j === i ? v : x)) })}
              />
            ))}
          </div>
          <div className={`mt-10 grid gap-7 ${gridCols}`}>
            {sample.categories.map((c) => {
              const catTier = tierFor(c.percent, config.tiers);
              return (
                <div
                  key={c.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    select('categoryScores', c.key);
                  }}
                  className={`rounded-xl border bg-white p-7 ${
                    sel.section === 'categoryScores' && sel.child === c.key ? 'border-primary' : 'border-gray-200'
                  }`}
                >
                  <h3 className="text-2xl font-semibold">{c.label}</h3>
                  <RichText
                    value={r.categoryTexts[c.key]?.[editTierKey] ?? ''}
                    onChange={(v) => patchCategoryText(c.key, v)}
                    className="mt-3 text-base leading-relaxed text-muted"
                  />
                  {page.categories.showScores && (
                    <>
                      <div className="mt-5 h-2 w-full rounded-full bg-gray-200">
                        <div className="h-2 rounded-full" style={{ width: `${c.percent}%`, backgroundColor: catTier.color }} />
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-xl font-semibold">
                        <span style={{ color: catTier.color }}>{c.percent}%</span>
                        {page.categories.showTier && <span style={{ color: catTier.color }}>{catTier.label}</span>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      );
    }
    if (k === 'cta') {
      return (
        <section key={k} onClick={() => select('cta')} className={`mx-auto max-w-6xl px-6 py-12 ${outline('cta')}`}>
          <RichText value={r.cta.heading} onChange={(v) => patchCta({ heading: v })} className="text-center text-2xl font-medium" />
          <div className={`mt-10 grid gap-10 ${device === 'mobile' ? '' : 'md:grid-cols-2 md:divide-x md:divide-gray-300'}`}>
            {(
              [
                { child: 'left', title: r.cta.leftTitle, body: r.cta.leftBody, button: r.cta.leftButton },
                { child: 'right', title: r.cta.rightTitle, body: r.cta.rightBody, button: r.cta.rightButton },
              ] as const
            ).map((item) => (
              <div
                key={item.child}
                onClick={(e) => {
                  e.stopPropagation();
                  select('cta', item.child);
                }}
                className={`px-6 text-center ${
                  sel.section === 'cta' && sel.child === item.child ? 'outline outline-2 outline-primary' : ''
                }`}
              >
                <RichText
                  value={item.title}
                  onChange={(v) => patchCta(item.child === 'left' ? { leftTitle: v } : { rightTitle: v })}
                  className="text-3xl font-medium"
                />
                <RichText
                  value={item.body}
                  onChange={(v) => patchCta(item.child === 'left' ? { leftBody: v } : { rightBody: v })}
                  className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-muted"
                />
                <RichText
                  value={item.button}
                  onChange={(v) => patchCta(item.child === 'left' ? { leftButton: v } : { rightButton: v })}
                  className="mt-6 inline-block rounded-md px-10 py-3.5 text-lg font-medium text-white"
                  style={{ backgroundColor: config.branding.primaryColor }}
                />
              </div>
            ))}
          </div>
        </section>
      );
    }
    // share
    return (
      <section
        key={k}
        onClick={() => select('share')}
        className={`px-6 py-9 ${outline('share')}`}
        style={{ backgroundColor: page.share.background }}
      >
        <RichText
          value={r.share}
          onChange={(v) => patchResults({ share: v })}
          className="text-center text-xl font-semibold"
          style={{ color: page.share.linksColor }}
        />
        <div className="mt-5 flex items-center justify-center gap-8" style={{ color: page.share.linksColor }}>
          {page.share.facebook && <span className="text-lg font-bold">f</span>}
          {page.share.twitter && <span className="text-lg font-bold">𝕏</span>}
          {page.share.linkedin && <span className="text-lg font-bold">in</span>}
        </div>
      </section>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-gray-100">
      <TopBar
        title={config.title}
        content="results"
        device={device}
        setDevice={setDevice}
        dirty={dirty}
        saving={saving}
        onSave={save}
      />

      <div className="flex min-h-0 flex-1">
        {/* Icon rail */}
        <div className="flex w-[72px] flex-none flex-col items-center gap-1 border-r border-gray-200 bg-white py-3">
          <RailButton label="Add section" onClick={() => alert('Re-add deleted sections with “Add Section” in the Sections panel.')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </RailButton>
          <RailButton label="Sections" active={rail === 'sections'} onClick={() => setRail('sections')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="h-5 w-5">
              <path d="M12 3 3 8l9 5 9-5-9-5Z" />
              <path d="m3 13 9 5 9-5" />
            </svg>
          </RailButton>
          <RailButton label="Theme" active={rail === 'theme'} onClick={() => setRail('theme')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M12 21a9 9 0 1 1 9-9c0 2.5-1.5 3.5-3 3.5h-2a2.5 2.5 0 0 0-2 4c.4.6 0 1.5-2 1.5Z" />
            </svg>
          </RailButton>
          <RailButton label="Page Settings" active={rail === 'page'} onClick={() => setRail('page')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5">
              <path d="M4 7h16M4 12h16M4 17h16" />
              <circle cx="9" cy="7" r="1.8" fill="white" />
              <circle cx="15" cy="12" r="1.8" fill="white" />
              <circle cx="7" cy="17" r="1.8" fill="white" />
            </svg>
          </RailButton>
        </div>

        {/* Panel column */}
        <div className="flex w-[300px] flex-none flex-col border-r border-gray-200 bg-white">
          {rail === 'sections' && (
            <>
              <p className="flex-none px-5 pb-2 pt-4 text-lg font-semibold">Sections</p>
              <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
                {/* Header + popup, pinned above the orderable sections */}
                <div
                  onClick={() => select('header')}
                  className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-sm ${
                    sel.section === 'header' ? 'bg-gray-200/70' : 'hover:bg-gray-100'
                  } ${isHidden('header') ? 'text-muted' : ''}`}
                >
                  Header
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleHidden('header');
                    }}
                    className="text-muted hover:text-ink"
                    aria-label={isHidden('header') ? 'Show Header' : 'Hide Header'}
                  >
                    <EyeIcon off={isHidden('header')} />
                  </button>
                </div>
                <div
                  onClick={() => select('changeDetails')}
                  className={`cursor-pointer rounded-md px-3 py-2.5 text-sm ${
                    sel.section === 'changeDetails' ? 'bg-gray-200/70' : 'hover:bg-gray-100'
                  }`}
                >
                  Change Details Form Popup
                </div>

                {/* Draggable middle sections */}
                {page.order.map((k, i) => (
                  <div key={k}>
                    <div
                      draggable
                      onDragStart={() => setDragIdx(i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragIdx != null) moveSection(dragIdx, i);
                        setDragIdx(null);
                      }}
                      onClick={() => select(k)}
                      className={`group flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2.5 text-sm ${
                        sel.section === k && !sel.child ? 'bg-gray-200/70' : 'hover:bg-gray-100'
                      } ${isHidden(k) ? 'text-muted' : ''}`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="flex-none cursor-grab text-muted" aria-hidden>
                          ⠿
                        </span>
                        {SECTION_LABELS[k]}
                        {k === 'categoryScores' && ` ${config.categories.length}`}
                      </span>
                      <span className="flex flex-none items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleHidden(k);
                          }}
                          className="text-muted hover:text-ink"
                          aria-label={isHidden(k) ? `Show ${SECTION_LABELS[k]}` : `Hide ${SECTION_LABELS[k]}`}
                        >
                          <EyeIcon off={isHidden(k)} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSection(k);
                          }}
                          className="hidden text-muted hover:text-tier-low group-hover:block"
                          aria-label={`Delete ${SECTION_LABELS[k]}`}
                        >
                          <TrashIcon />
                        </button>
                      </span>
                    </div>
                    {k === 'categoryScores' && (
                      <div className="ml-6 border-l border-gray-100 pl-2">
                        {config.categories.map((c) => (
                          <div
                            key={c.key}
                            onClick={() => select('categoryScores', c.key)}
                            className={`cursor-pointer rounded-md px-3 py-2 text-sm ${
                              sel.section === 'categoryScores' && sel.child === c.key ? 'bg-gray-200/70' : 'hover:bg-gray-100'
                            }`}
                          >
                            {c.label}
                          </div>
                        ))}
                      </div>
                    )}
                    {k === 'cta' && (
                      <div className="ml-6 border-l border-gray-100 pl-2">
                        {(['left', 'right'] as const).map((child) => (
                          <div
                            key={child}
                            onClick={() => select('cta', child)}
                            className={`cursor-pointer rounded-md px-3 py-2 text-sm ${
                              sel.section === 'cta' && sel.child === child ? 'bg-gray-200/70' : 'hover:bg-gray-100'
                            }`}
                          >
                            Item
                          </div>
                        ))}
                        <button
                          onClick={() => alert('Additional CTA items are on the roadmap.')}
                          className="px-3 py-2 text-sm font-medium text-primary hover:underline"
                        >
                          ⊕ Add Item
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {removedSections.length > 0 && (
                  <div className="mt-1 px-3">
                    <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted">Add Section</p>
                    {removedSections.map((k) => (
                      <button
                        key={k}
                        onClick={() => patchPage({ order: [...page.order, k] })}
                        className="block py-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        ⊕ {SECTION_LABELS[k]}
                      </button>
                    ))}
                  </div>
                )}

                <div
                  onClick={() => select('footer')}
                  className={`mt-1 flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-sm ${
                    sel.section === 'footer' ? 'bg-gray-200/70' : 'hover:bg-gray-100'
                  } ${isHidden('footer') ? 'text-muted' : ''}`}
                >
                  Footer
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleHidden('footer');
                    }}
                    className="text-muted hover:text-ink"
                    aria-label={isHidden('footer') ? 'Show Footer' : 'Hide Footer'}
                  >
                    <EyeIcon off={isHidden('footer')} />
                  </button>
                </div>
              </div>
            </>
          )}

          {rail === 'theme' && <ThemePanel branding={config.branding} onChange={(b) => patch({ branding: b })} />}

          {rail === 'page' && (
            <div className="overflow-y-auto px-5 py-4">
              <p className="text-lg font-semibold">Page Settings</p>
              <FieldLabel>Scorecard title</FieldLabel>
              <TextInput value={config.title} onChange={(e) => patch({ title: e.target.value })} />
              <FieldLabel>Copyright</FieldLabel>
              <TextInput value={config.copyright} onChange={(e) => patch({ copyright: e.target.value })} />
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="min-w-0 flex-1 overflow-y-auto p-5">
          <div className={`mx-auto min-h-full bg-white shadow-card ${device === 'mobile' ? 'max-w-[400px]' : 'max-w-5xl'}`}>
            {!isHidden('header') && (
              <div onClick={() => select('header')} className={`flex justify-center border-b border-gray-100 py-6 ${outline('header')}`}>
                <img src={config.branding.logoUrl} alt="" className="h-20 w-auto object-contain" />
              </div>
            )}
            {page.order.map((k) => renderSection(k))}
            {!isHidden('footer') && (
              <div
                onClick={() => select('footer')}
                className={`flex items-center justify-between border-t border-gray-200 px-8 py-6 ${outline('footer')}`}
              >
                <img src={config.branding.logoUrl} alt="" className="h-12 w-auto object-contain" />
                <RichText value={config.copyright} onChange={(v) => patch({ copyright: v })} className="text-sm text-muted" />
              </div>
            )}
          </div>
        </div>

        {/* Right pane */}
        <div className="w-[300px] flex-none overflow-y-auto border-l border-gray-200 bg-white px-5 py-4">
          {rail === 'sections' ? (
            <>
              <p className="border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide">
                {sel.section === 'categoryScores' && sel.child
                  ? config.categories.find((c) => c.key === sel.child)?.label ?? 'Category'
                  : sel.section === 'cta' && sel.child
                    ? 'Item'
                    : SECTION_LABELS[sel.section]}
              </p>

              {sel.section === 'header' && (
                <FieldRow label="Show header">
                  <Toggle on={!isHidden('header')} onChange={() => toggleHidden('header')} label="Show header" />
                </FieldRow>
              )}

              {sel.section === 'changeDetails' && (
                <>
                  <p className="mt-3 text-xs text-muted">
                    Shown when a visitor clicks “{r.changeEmailLabel}” or “{r.cta.rightButton}”.
                  </p>
                  <FieldLabel>Heading</FieldLabel>
                  <TextInput
                    value={r.changeDetails.heading}
                    onChange={(e) => patchResults({ changeDetails: { ...r.changeDetails, heading: e.target.value } })}
                  />
                  <FieldLabel>Subheading</FieldLabel>
                  <TextInput
                    value={r.changeDetails.subheading}
                    onChange={(e) => patchResults({ changeDetails: { ...r.changeDetails, subheading: e.target.value } })}
                  />
                  <FieldLabel>Submit button label</FieldLabel>
                  <TextInput
                    value={r.changeDetails.submitLabel}
                    onChange={(e) => patchResults({ changeDetails: { ...r.changeDetails, submitLabel: e.target.value } })}
                  />
                </>
              )}

              {sel.section === 'speedChart' && !sel.child && (
                <>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">Logic</p>
                  <TierPicker />
                  <p className="mt-6 border-t border-gray-200 pt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                    Display options
                  </p>
                  <FieldLabel>Chart position</FieldLabel>
                  <SelectInput
                    value={page.speedChart.chartPosition}
                    onChange={(e) =>
                      patchPage({ speedChart: { ...page.speedChart, chartPosition: e.target.value as 'left' | 'right' } })
                    }
                  >
                    <option value="right">Right</option>
                    <option value="left">Left</option>
                  </SelectInput>
                  <FieldRow label="Show overall score">
                    <Toggle
                      on={page.speedChart.showOverall}
                      onChange={(on) => patchPage({ speedChart: { ...page.speedChart, showOverall: on } })}
                      label="Show overall score"
                    />
                  </FieldRow>
                  <FieldLabel>Overall score format</FieldLabel>
                  <SelectInput
                    value={page.speedChart.scoreFormat}
                    onChange={(e) =>
                      patchPage({ speedChart: { ...page.speedChart, scoreFormat: e.target.value as 'percent' | 'outof100' } })
                    }
                  >
                    <option value="percent">Percent</option>
                    <option value="outof100">Score out of 100</option>
                  </SelectInput>
                  <FieldRow label="Show tiers">
                    <Toggle
                      on={page.speedChart.showTiers}
                      onChange={(on) => patchPage({ speedChart: { ...page.speedChart, showTiers: on } })}
                      label="Show tiers"
                    />
                  </FieldRow>
                  <button
                    onClick={() => removeSection('speedChart')}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-tier-low py-2.5 text-sm font-medium text-tier-low hover:bg-red-50"
                  >
                    <TrashIcon /> Remove Section
                  </button>
                </>
              )}

              {sel.section === 'categoryScores' && !sel.child && (
                <>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">Display options</p>
                  <FieldLabel>Order categories</FieldLabel>
                  <SelectInput value="fixed" onChange={() => {}}>
                    <option value="fixed">Fixed Order</option>
                  </SelectInput>
                  <FieldLabel>Number of categories shown</FieldLabel>
                  <SelectInput value="all" onChange={() => {}}>
                    <option value="all">All</option>
                  </SelectInput>
                  <FieldLabel>Items per row</FieldLabel>
                  <SelectInput
                    value={String(page.categories.itemsPerRow)}
                    onChange={(e) => patchPage({ categories: { ...page.categories, itemsPerRow: Number(e.target.value) } })}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </SelectInput>
                  <FieldRow label="Show scores">
                    <Toggle
                      on={page.categories.showScores}
                      onChange={(on) => patchPage({ categories: { ...page.categories, showScores: on } })}
                      label="Show scores"
                    />
                  </FieldRow>
                  <FieldLabel>Score format</FieldLabel>
                  <SelectInput value="percent" onChange={() => {}}>
                    <option value="percent">Actual percent</option>
                  </SelectInput>
                  <FieldRow label="Show score tier">
                    <Toggle
                      on={page.categories.showTier}
                      onChange={(on) => patchPage({ categories: { ...page.categories, showTier: on } })}
                      label="Show score tier"
                    />
                  </FieldRow>
                  <button
                    onClick={() => removeSection('categoryScores')}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-tier-low py-2.5 text-sm font-medium text-tier-low hover:bg-red-50"
                  >
                    <TrashIcon /> Remove Section
                  </button>
                </>
              )}

              {sel.section === 'categoryScores' && sel.child && (
                <>
                  <TierPicker />
                  <p className="mt-4 text-xs text-muted">
                    Edit this category’s {editTier.label} copy directly in the preview. Switch tiers above to edit the
                    other variants.
                  </p>
                </>
              )}

              {sel.section === 'cta' && sel.child && (
                <>
                  <FieldRow label="Dynamic content">
                    <Toggle on={false} onChange={() => alert('Dynamic CTA content is on the roadmap.')} label="Dynamic content" />
                  </FieldRow>
                  <ActionField
                    options={['report', 'details', 'lead-form', 'page', 'url']}
                    value={
                      sel.child === 'left'
                        ? (r.cta.leftAction ?? { type: 'report' })
                        : (r.cta.rightAction ?? { type: 'details' })
                    }
                    onChange={(a) => patchCta(sel.child === 'left' ? { leftAction: a } : { rightAction: a })}
                  />
                  <FieldLabel>Item image</FieldLabel>
                  <button
                    onClick={() => alert('Item images are on the roadmap.')}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm text-muted hover:bg-gray-50"
                  >
                    Select image
                  </button>
                  <button
                    onClick={() => alert('The two CTA items are fixed for now — hide the whole section instead.')}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-tier-low py-2.5 text-sm font-medium text-tier-low hover:bg-red-50"
                  >
                    <TrashIcon /> Remove Item
                  </button>
                </>
              )}

              {sel.section === 'cta' && !sel.child && (
                <>
                  <p className="mt-3 text-xs text-muted">Select an item in the list or preview to edit its settings.</p>
                  <button
                    onClick={() => removeSection('cta')}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-tier-low py-2.5 text-sm font-medium text-tier-low hover:bg-red-50"
                  >
                    <TrashIcon /> Remove Section
                  </button>
                </>
              )}

              {sel.section === 'share' && (
                <>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">Content</p>
                  <FieldRow label="Show Facebook link">
                    <Toggle
                      on={page.share.facebook}
                      onChange={(on) => patchPage({ share: { ...page.share, facebook: on } })}
                      label="Show Facebook link"
                    />
                  </FieldRow>
                  <FieldRow label="Show Twitter link">
                    <Toggle
                      on={page.share.twitter}
                      onChange={(on) => patchPage({ share: { ...page.share, twitter: on } })}
                      label="Show Twitter link"
                    />
                  </FieldRow>
                  <FieldRow label="Show LinkedIn link">
                    <Toggle
                      on={page.share.linkedin}
                      onChange={(on) => patchPage({ share: { ...page.share, linkedin: on } })}
                      label="Show LinkedIn link"
                    />
                  </FieldRow>
                  <p className="mt-6 border-t border-gray-200 pt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                    Section style
                  </p>
                  <ColorField
                    label="Section Background"
                    sub="Secondary colour"
                    value={page.share.background}
                    onChange={(v) => patchPage({ share: { ...page.share, background: v } })}
                  />
                  <ColorField
                    label="Links color"
                    sub={page.share.linksColor}
                    value={page.share.linksColor}
                    onChange={(v) => patchPage({ share: { ...page.share, linksColor: v } })}
                  />
                  <button
                    onClick={() => removeSection('share')}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-tier-low py-2.5 text-sm font-medium text-tier-low hover:bg-red-50"
                  >
                    <TrashIcon /> Remove Section
                  </button>
                </>
              )}

              {sel.section === 'footer' && (
                <>
                  <FieldRow label="Show footer">
                    <Toggle on={!isHidden('footer')} onChange={() => toggleHidden('footer')} label="Show footer" />
                  </FieldRow>
                  <FieldLabel>Copyright text</FieldLabel>
                  <TextInput value={config.copyright} onChange={(e) => patch({ copyright: e.target.value })} />
                </>
              )}
            </>
          ) : (
            <p className="pt-2 text-sm text-muted">
              {rail === 'theme'
                ? 'Theme changes apply across the scorecard. Edit them in the panel on the left.'
                : 'Page settings are edited in the panel on the left.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
