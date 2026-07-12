'use client';

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExtraSection, ScorecardConfig } from '@/lib/types';
import { SECTION_LIBRARY } from '@/lib/sectionLibrary';
import ExtraSectionView from '@/components/ExtraSectionView';
import {
  ActionField,
  EyeIcon,
  FieldLabel,
  FieldRow,
  ImagePicker,
  RailButton,
  RichText,
  SelectInput,
  TextInput,
  Toggle,
  TrashIcon,
} from './ui';
import ThemePanel from './ThemePanel';
import TopBar from './TopBar';

type Rail = 'sections' | 'add' | 'theme' | 'page';
type Section = string; // header | leadform | banner | categories | cta | footer | extra ids
const CORE = ['banner', 'categories', 'cta'];

// ScoreApp-style landing page editor: sections rail on the left, live inline
// editable preview in the middle, section style settings on the right.
export default function LandingEditor({ initialConfig }: { initialConfig: ScorecardConfig }) {
  const router = useRouter();
  const [config, setConfig] = useState<ScorecardConfig>(initialConfig);
  const [rail, setRail] = useState<Rail>('sections');
  const [selSection, setSelSection] = useState<Section>('banner');
  const [selCard, setSelCard] = useState<number | null>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [galleryCat, setGalleryCat] = useState(SECTION_LIBRARY[0].key);
  const [insertAt, setInsertAt] = useState<number | null>(null);

  const landing = config.landing;
  const extras = landing.extraSections ?? [];
  const sectionOrder: string[] =
    landing.sectionOrder && landing.sectionOrder.length ? landing.sectionOrder : ['banner', 'categories', 'cta'];

  function addExtra(preset: Omit<ExtraSection, 'id'>) {
    const id = `x${Date.now().toString(36)}`;
    const section: ExtraSection = { id, ...preset };
    const order = [...sectionOrder];
    order.splice(insertAt ?? order.length, 0, id);
    patchLanding({ extraSections: [...extras, section], sectionOrder: order });
    setInsertAt(null);
    setRail('sections');
    setSelSection(id);
    setSelCard(null);
  }
  function patchExtra(id: string, p: Partial<ExtraSection>) {
    patchLanding({ extraSections: extras.map((x) => (x.id === id ? { ...x, ...p } : x)) });
  }
  function removeExtra(id: string) {
    if (!confirm('Delete this section?')) return;
    patchLanding({
      extraSections: extras.filter((x) => x.id !== id),
      sectionOrder: sectionOrder.filter((k) => k !== id),
    });
    if (selSection === id) setSelSection('banner');
  }
  const selExtra = extras.find((x) => x.id === selSection);

  function moveSection(from: number, to: number) {
    if (from < 0 || to < 0 || to >= sectionOrder.length || from === to) return;
    const order = [...sectionOrder];
    const [item] = order.splice(from, 1);
    order.splice(to, 0, item);
    patchLanding({ sectionOrder: order });
  }

  function patch(p: Partial<ScorecardConfig>) {
    setConfig((c) => ({ ...c, ...p }));
    setDirty(true);
  }
  function patchLanding(p: Partial<ScorecardConfig['landing']>) {
    patch({ landing: { ...landing, ...p } });
  }
  function patchCard(i: number, p: Partial<ScorecardConfig['landing']['categoryCards'][number]>) {
    patchLanding({
      categoryCards: landing.categoryCards.map((c, j) => (j === i ? { ...c, ...p } : c)),
    });
  }

  async function save() {
    setSaving(true);
    const res = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: config.title,
        copyright: config.copyright,
        branding: config.branding,
        landing: config.landing,
        leadForm: config.leadForm,
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

  function select(s: Section, card: number | null = null) {
    setSelSection(s);
    setSelCard(card);
    if (rail !== 'sections') setRail('sections');
  }

  const outline = (s: Section) =>
    `cursor-pointer transition ${
      rail === 'sections' && selSection === s
        ? 'outline outline-2 outline-primary'
        : 'outline outline-1 outline-transparent hover:outline-primary/40'
    }`;

  const perRow = landing.categoriesPerRow === 1 ? 'md:grid-cols-1' : 'md:grid-cols-2';
  const heroLeft = landing.imagePosition === 'left';

  const TYPE_LABELS: Record<string, string> = {
    banner2: 'Banner',
    form: 'On Page Form',
    cta2: 'Call to Action',
    testimonials: 'Testimonials',
    categories2: 'Categories',
    video: 'Video',
    html: 'Custom HTML',
    content: 'Content',
    faq: 'FAQ',
  };
  function middleLabel(k: string): string {
    if (k === 'banner') return 'Banner';
    if (k === 'categories') return `Categories ${landing.categoryCards.length}`;
    if (k === 'cta') return 'Call to Action';
    const x = extras.find((e) => e.id === k);
    return x ? TYPE_LABELS[x.type] ?? 'Section' : 'Section';
  }
  const SECTION_ROWS: { key: Section; label: string; hideable?: boolean; shown?: boolean; draggable?: boolean; removable?: boolean }[] = [
    { key: 'header', label: 'Header', hideable: true, shown: landing.showHeader !== false },
    { key: 'leadform', label: 'Lead Form Popup' },
    ...sectionOrder.map((k) => ({ key: k, label: middleLabel(k), draggable: true, removable: !CORE.includes(k) })),
    { key: 'footer', label: 'Footer', hideable: true, shown: landing.showFooter !== false },
  ];

  // Blue plus circle between sections: click to insert a new section there.
  function PlusZone({ index }: { index: number }) {
    return (
      <div className="group/plus relative z-10 -my-3 flex h-6 items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setInsertAt(index);
            setRail('add');
          }}
          title="Add a section here"
          aria-label="Add a section here"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white opacity-0 shadow-card transition group-hover/plus:opacity-100"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="h-3.5 w-3.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-gray-100">
      <TopBar
        title={config.title}
        content="landing"
        device={device}
        setDevice={setDevice}
        dirty={dirty}
        saving={saving}
        onSave={save}
      />

      <div className="flex min-h-0 flex-1">
        {/* Icon rail */}
        <div className="flex w-[72px] flex-none flex-col items-center gap-1 border-r border-gray-200 bg-white py-3">
          <RailButton label="Add section" active={rail === 'add'} onClick={() => { setInsertAt(null); setRail('add'); }}>
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
        <div className={`flex flex-none flex-col border-r border-gray-200 bg-white ${rail === 'add' ? 'w-[560px]' : 'w-[300px]'}`}>
          {rail === 'add' && (
            <div className="flex min-h-0 flex-1">
              <div className="flex w-56 flex-none flex-col border-r border-gray-100">
                <div className="flex items-center justify-between px-4 pb-2 pt-4">
                  <p className="text-lg font-semibold">Add a section</p>
                  <button onClick={() => setRail('sections')} className="text-muted hover:text-ink" aria-label="Close">
                    ✕
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
                  {SECTION_LIBRARY.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setGalleryCat(cat.key)}
                      className={`block w-full rounded-md px-3 py-2.5 text-left text-sm ${
                        galleryCat === cat.key ? 'bg-gray-200/70 font-medium' : 'hover:bg-gray-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4">
                <p className="pb-3 text-sm font-semibold">
                  {SECTION_LIBRARY.find((c) => c.key === galleryCat)?.label}
                </p>
                <div className="space-y-4">
                  {SECTION_LIBRARY.find((c) => c.key === galleryCat)?.presets.map((preset) => {
                    const sample = preset.make();
                    const dark = sample.style?.includes('dark') || sample.style === 'boxed';
                    return (
                      <button
                        key={preset.key}
                        onClick={() => addExtra(preset.make())}
                        title={`Add ${preset.label}`}
                        className="block w-full overflow-hidden rounded-lg border border-gray-200 text-left transition hover:border-primary hover:shadow-card"
                      >
                        {/* Mini design preview */}
                        <div className={`pointer-events-none p-4 ${dark ? 'bg-navy' : 'bg-white'}`}>
                          <div className={`mx-auto h-2.5 w-2/3 rounded-full ${dark ? 'bg-white/70' : 'bg-gray-700/80'}`} />
                          <div className={`mx-auto mt-2 h-1.5 w-11/12 rounded-full ${dark ? 'bg-white/30' : 'bg-gray-300'}`} />
                          <div className={`mx-auto mt-1 h-1.5 w-4/5 rounded-full ${dark ? 'bg-white/30' : 'bg-gray-300'}`} />
                          {sample.type === 'form' && (
                            <div className="mx-auto mt-3 w-3/4 space-y-1.5 rounded bg-white p-2 shadow-sm">
                              <div className="h-2 rounded-sm border border-gray-300" />
                              <div className="h-2 rounded-sm border border-gray-300" />
                              <div className="h-2.5 rounded-sm bg-primary" />
                            </div>
                          )}
                          {(sample.type === 'banner2' || sample.type === 'content') && sample.image && (
                            <div className={`mt-3 flex gap-2 ${sample.style === 'image-left' ? 'flex-row-reverse' : ''}`}>
                              <div className="flex-1 space-y-1.5">
                                <div className={`h-1.5 rounded-full ${dark ? 'bg-white/30' : 'bg-gray-300'}`} />
                                <div className={`h-1.5 w-3/4 rounded-full ${dark ? 'bg-white/30' : 'bg-gray-300'}`} />
                                {sample.button && <div className="mt-1 h-2.5 w-1/2 rounded-sm bg-primary" />}
                              </div>
                              <div className="h-12 w-16 flex-none rounded bg-gray-400/60" />
                            </div>
                          )}
                          {(sample.type === 'cta2' || (sample.type === 'banner2' && !sample.image)) && (
                            <div className="mx-auto mt-3 h-3 w-1/3 rounded-sm bg-primary" />
                          )}
                          {sample.type === 'testimonials' && (
                            <div className="mt-3 flex justify-center gap-2">
                              {(sample.items ?? []).slice(0, 3).map((_, i) => (
                                <div key={i} className={`h-10 w-16 rounded ${dark ? 'bg-white/15' : 'border border-gray-200 bg-gray-50'}`} />
                              ))}
                            </div>
                          )}
                          {sample.type === 'categories2' && (
                            <div className="mt-3 flex justify-center gap-2">
                              {[0, 1, 2, 3].map((i) => (
                                <div key={i} className={`h-10 w-12 rounded ${dark ? 'bg-white/15' : 'border border-gray-200 bg-gray-50'}`} />
                              ))}
                            </div>
                          )}
                          {sample.type === 'video' && (
                            <div className="mx-auto mt-3 flex h-14 w-3/4 items-center justify-center rounded bg-gray-900">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[9px] text-white">▶</span>
                            </div>
                          )}
                          {sample.type === 'faq' && (
                            <div className="mt-3 space-y-1.5">
                              {[0, 1, 2].map((i) => (
                                <div key={i} className="flex items-center justify-between border-b border-gray-200 pb-1">
                                  <div className="h-1.5 w-2/3 rounded-full bg-gray-300" />
                                  <span className="text-[9px] text-muted">⌄</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {sample.type === 'html' && (
                            <div className="mx-auto mt-3 flex h-10 w-3/4 items-center justify-center rounded border border-dashed border-gray-300 text-[10px] text-muted">
                              {'</>'}
                            </div>
                          )}
                        </div>
                        <p className="border-t border-gray-100 px-3 py-2 text-xs font-medium text-muted">{preset.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {rail === 'sections' && (
            <>
              <p className="flex-none px-5 pb-2 pt-4 text-lg font-semibold">Sections</p>
              <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
                {SECTION_ROWS.map((s) => (
                  <div key={s.key}>
                    <div
                      draggable={s.draggable}
                      onDragStart={() => setDragIdx(sectionOrder.indexOf(s.key))}
                      onDragOver={(e) => s.draggable && e.preventDefault()}
                      onDrop={() => {
                        if (s.draggable && dragIdx != null) moveSection(dragIdx, sectionOrder.indexOf(s.key));
                        setDragIdx(null);
                      }}
                      onClick={() => select(s.key)}
                      className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-sm ${
                        selSection === s.key && selCard == null ? 'bg-gray-200/70' : 'hover:bg-gray-100'
                      } ${s.hideable && !s.shown ? 'text-muted' : ''}`}
                    >
                      <span className="flex items-center gap-2">
                        {s.draggable && (
                          <span className="cursor-grab text-muted" aria-hidden>
                            ⠿
                          </span>
                        )}
                        {s.label}
                      </span>
                      {s.hideable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (s.key === 'header') patchLanding({ showHeader: !(landing.showHeader !== false) });
                            if (s.key === 'footer') patchLanding({ showFooter: !(landing.showFooter !== false) });
                          }}
                          className="text-muted hover:text-ink"
                          aria-label={s.shown ? `Hide ${s.label}` : `Show ${s.label}`}
                        >
                          <EyeIcon off={!s.shown} />
                        </button>
                      )}
                      {s.removable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeExtra(s.key);
                          }}
                          className="text-muted hover:text-tier-low"
                          aria-label={`Delete ${s.label}`}
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                    {s.key === 'categories' && (
                      <div className="ml-5 border-l border-gray-100 pl-2">
                        {landing.categoryCards.map((c, i) => (
                          <div
                            key={i}
                            onClick={() => select('categories', i)}
                            className={`cursor-pointer rounded-md px-3 py-2 text-sm ${
                              selSection === 'categories' && selCard === i ? 'bg-gray-200/70' : 'hover:bg-gray-100'
                            }`}
                          >
                            {c.title || 'Category'}
                          </div>
                        ))}
                        <button
                          onClick={() =>
                            patchLanding({
                              categoryCards: [
                                ...landing.categoryCards,
                                { key: `cat-${Date.now().toString(36)}`, title: 'New Category', body: 'Describe this category.', image: '/images/card-1.png' },
                              ],
                            })
                          }
                          className="px-3 py-2 text-sm font-medium text-primary hover:underline"
                        >
                          ⊕ Add Category
                        </button>
                      </div>
                    )}
                  </div>
                ))}
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
            {/* Header */}
            {landing.showHeader !== false && (
              <div onClick={() => select('header')} className={`flex justify-center py-6 ${outline('header')}`}>
                <img src={config.branding.logoUrl} alt="" className="h-20 w-auto object-contain" />
              </div>
            )}

            <PlusZone index={0} />
            {sectionOrder.map((sk, orderIdx) => {
              const after = <PlusZone key={`plus-${sk}`} index={orderIdx + 1} />;
              const extra = extras.find((x) => x.id === sk);
              if (extra)
                return (
                  <div key={sk}>
                    <div
                      onClick={() => select(sk)}
                      className={outline(sk)}
                    >
                      <ExtraSectionView section={extra} config={config} editable />
                    </div>
                    {after}
                  </div>
                );
              if (sk === 'banner')
                return (
                  <div key="banner-wrap">
            <div
              key="banner"
              onClick={() => select('banner')}
              className={`grid items-center gap-10 px-8 pb-16 pt-6 ${device === 'mobile' ? '' : 'md:grid-cols-2'} ${outline('banner')}`}
            >
              <div className={heroLeft && device !== 'mobile' ? 'md:order-2' : ''}>
                <RichText
                  value={landing.heroTitle}
                  onChange={(v) => patchLanding({ heroTitle: v })}
                  className="text-4xl font-bold leading-tight md:text-5xl"
                  style={{ color: config.branding.headingTextColor }}
                />
                <RichText
                  value={landing.heroSubtitle}
                  onChange={(v) => patchLanding({ heroSubtitle: v })}
                  className="mt-5 text-xl font-medium"
                />
                <RichText
                  value={landing.heroBody}
                  onChange={(v) => patchLanding({ heroBody: v })}
                  className="mt-5 text-base leading-relaxed text-muted"
                />
                <ul className="mt-6 space-y-2.5">
                  {landing.heroBullets.map((b, i) => (
                    <li key={i} className="group flex items-center gap-3 text-base">
                      <svg className="h-5 w-5 flex-none text-primary" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M3 11l4 4 10-11" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <RichText
                        value={b}
                        onChange={(v) =>
                          patchLanding({ heroBullets: landing.heroBullets.map((x, j) => (j === i ? v : x)) })
                        }
                        className="flex-1"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          patchLanding({ heroBullets: landing.heroBullets.filter((_, j) => j !== i) });
                        }}
                        className="hidden text-muted hover:text-tier-low group-hover:block"
                        aria-label="Remove bullet"
                      >
                        <TrashIcon />
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    patchLanding({ heroBullets: [...landing.heroBullets, 'New bullet point'] });
                  }}
                  className="mt-3 text-sm font-medium text-primary hover:underline"
                >
                  + Add bullet
                </button>
                <div className="mt-7">
                  <RichText
                    value={landing.heroCta}
                    onChange={(v) => patchLanding({ heroCta: v })}
                    className="inline-block w-full max-w-sm rounded-md px-10 py-3.5 text-center text-lg font-medium text-white"
                    style={{ backgroundColor: config.branding.primaryColor }}
                  />
                </div>
              </div>
              <div className={`flex justify-center ${heroLeft && device !== 'mobile' ? 'md:order-1' : ''}`}>
                <img
                  src={landing.heroImage || '/images/hero-report.png'}
                  alt=""
                  className="w-full max-w-[420px] rounded-lg shadow-card"
                />
              </div>
            </div>
                    {after}
                  </div>
                );
              if (sk === 'categories')
                return (
                  <div key="categories-wrap">
            <div key="categories" onClick={() => select('categories')} className={`px-8 py-12 ${outline('categories')}`}>
              <RichText
                value={landing.howItWorksLabel}
                onChange={(v) => patchLanding({ howItWorksLabel: v })}
                className="text-center text-base"
              />
              <RichText
                value={landing.howItWorksTitle}
                onChange={(v) => patchLanding({ howItWorksTitle: v })}
                className="mt-3 text-center text-3xl font-bold md:text-4xl"
                style={{ color: config.branding.headingTextColor }}
              />
              <RichText
                value={landing.howItWorksBody}
                onChange={(v) => patchLanding({ howItWorksBody: v })}
                className="mx-auto mt-4 max-w-3xl text-center text-base leading-relaxed text-muted"
              />
              <div className={`mt-10 grid gap-6 ${device === 'mobile' ? '' : perRow}`}>
                {landing.categoryCards.map((card, i) => (
                  <div
                    key={card.key || i}
                    onClick={(e) => {
                      e.stopPropagation();
                      select('categories', i);
                    }}
                    className={`border bg-white px-6 py-10 text-center ${
                      selSection === 'categories' && selCard === i ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img src={card.image} alt="" className="mx-auto h-[72px] w-[72px] object-contain" />
                    <RichText
                      value={card.title}
                      onChange={(v) => patchCard(i, { title: v })}
                      className="mt-5 text-xl font-semibold"
                    />
                    <RichText
                      value={card.body}
                      onChange={(v) => patchCard(i, { body: v })}
                      className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted"
                    />
                  </div>
                ))}
              </div>
            </div>
                    {after}
                  </div>
                );
              return (
                <div key="cta-wrap">
            <div key="cta" onClick={() => select('cta')} className={`px-8 py-16 text-center ${outline('cta')}`}>
              <RichText
                value={landing.bottomTitle}
                onChange={(v) => patchLanding({ bottomTitle: v })}
                className="text-3xl font-bold md:text-4xl"
                style={{ color: config.branding.headingTextColor }}
              />
              <RichText
                value={landing.bottomBody}
                onChange={(v) => patchLanding({ bottomBody: v })}
                className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted"
              />
              <div className="mt-7">
                <RichText
                  value={landing.bottomCta}
                  onChange={(v) => patchLanding({ bottomCta: v })}
                  className="inline-block rounded-md px-12 py-3.5 text-lg font-medium text-white"
                  style={{ backgroundColor: config.branding.primaryColor }}
                />
              </div>
              <RichText
                value={landing.bottomNote}
                onChange={(v) => patchLanding({ bottomNote: v })}
                className="mt-7 text-base text-muted"
              />
            </div>
                  {after}
                </div>
              );
            })}

            {/* Footer */}
            {landing.showFooter !== false && (
              <div
                onClick={() => select('footer')}
                className={`flex items-center justify-between border-t border-gray-200 px-8 py-6 ${outline('footer')}`}
              >
                <img src={config.branding.logoUrl} alt="" className="h-12 w-auto object-contain" />
                <RichText
                  value={config.copyright}
                  onChange={(v) => patch({ copyright: v })}
                  className="text-sm text-muted"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right pane */}
        <div className="w-[300px] flex-none overflow-y-auto border-l border-gray-200 bg-white px-5 py-4">
          {rail === 'sections' ? (
            <>
              <p className="border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide">
                {selSection === 'categories' && selCard != null
                  ? 'Category'
                  : selExtra
                    ? TYPE_LABELS[selExtra.type]
                    : SECTION_ROWS.find((s) => s.key === selSection)?.label}
              </p>

              {selExtra && (
                <>
                  {selExtra.type !== 'html' && selExtra.type !== 'form' && (
                    <>
                      <FieldLabel>Title</FieldLabel>
                      <TextInput value={selExtra.title ?? ''} onChange={(e) => patchExtra(selExtra.id, { title: e.target.value })} />
                    </>
                  )}
                  {selExtra.type !== 'html' && (
                    <>
                      {selExtra.type === 'form' && (
                        <>
                          <FieldLabel>Title</FieldLabel>
                          <TextInput value={selExtra.title ?? ''} onChange={(e) => patchExtra(selExtra.id, { title: e.target.value })} />
                        </>
                      )}
                      {selExtra.type !== 'testimonials' && selExtra.type !== 'faq' && (
                        <>
                          <FieldLabel>Body</FieldLabel>
                          <textarea
                            value={selExtra.body ?? ''}
                            onChange={(e) => patchExtra(selExtra.id, { body: e.target.value })}
                            rows={3}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary"
                          />
                        </>
                      )}
                    </>
                  )}

                  {(selExtra.type === 'banner2' || selExtra.type === 'cta2' || selExtra.type === 'video') && (
                    <>
                      <FieldLabel>Button text (empty = no button)</FieldLabel>
                      <TextInput value={selExtra.button ?? ''} onChange={(e) => patchExtra(selExtra.id, { button: e.target.value })} />
                      {selExtra.button && (
                        <ActionField value={selExtra.action} onChange={(a) => patchExtra(selExtra.id, { action: a })} />
                      )}
                    </>
                  )}

                  {(selExtra.type === 'banner2' || selExtra.type === 'content' || selExtra.type === 'form') && (
                    <ImagePicker
                      label="Image (empty = text only)"
                      value={selExtra.image ?? ''}
                      onChange={(v) => patchExtra(selExtra.id, { image: v })}
                    />
                  )}

                  {selExtra.type === 'video' && (
                    <>
                      <FieldLabel>Video URL (YouTube or Vimeo)</FieldLabel>
                      <TextInput
                        value={selExtra.url ?? ''}
                        placeholder="https://youtube.com/watch?v=…"
                        onChange={(e) => patchExtra(selExtra.id, { url: e.target.value })}
                      />
                    </>
                  )}

                  {selExtra.type === 'html' && (
                    <>
                      <FieldLabel>Custom HTML</FieldLabel>
                      <textarea
                        value={selExtra.html ?? ''}
                        onChange={(e) => patchExtra(selExtra.id, { html: e.target.value })}
                        rows={10}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-xs outline-none focus:border-primary"
                      />
                    </>
                  )}

                  {(selExtra.type === 'testimonials' || selExtra.type === 'faq') && (
                    <>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                        {selExtra.type === 'faq' ? 'Questions' : 'Testimonials'}
                      </p>
                      {(selExtra.items ?? []).map((item, i) => (
                        <div key={i} className="mt-3 rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted">#{i + 1}</span>
                            <button
                              onClick={() =>
                                patchExtra(selExtra.id, { items: (selExtra.items ?? []).filter((_, j) => j !== i) })
                              }
                              className="text-muted hover:text-tier-low"
                              aria-label="Remove item"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                          <TextInput
                            className="mt-2"
                            value={item.title}
                            placeholder={selExtra.type === 'faq' ? 'Question' : 'Name'}
                            onChange={(e) =>
                              patchExtra(selExtra.id, {
                                items: (selExtra.items ?? []).map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                              })
                            }
                          />
                          <textarea
                            value={item.body}
                            placeholder={selExtra.type === 'faq' ? 'Answer' : 'Quote'}
                            onChange={(e) =>
                              patchExtra(selExtra.id, {
                                items: (selExtra.items ?? []).map((x, j) => (j === i ? { ...x, body: e.target.value } : x)),
                              })
                            }
                            rows={2}
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary"
                          />
                          {selExtra.type === 'testimonials' && (
                            <TextInput
                              className="mt-2"
                              value={item.meta ?? ''}
                              placeholder="Role / company"
                              onChange={(e) =>
                                patchExtra(selExtra.id, {
                                  items: (selExtra.items ?? []).map((x, j) => (j === i ? { ...x, meta: e.target.value } : x)),
                                })
                              }
                            />
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          patchExtra(selExtra.id, {
                            items: [...(selExtra.items ?? []), { title: '', body: '', meta: '' }],
                          })
                        }
                        className="mt-3 text-sm font-medium text-primary hover:underline"
                      >
                        + Add item
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => removeExtra(selExtra.id)}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-tier-low py-2.5 text-sm font-medium text-tier-low hover:bg-red-50"
                  >
                    <TrashIcon /> Remove Section
                  </button>
                </>
              )}

              {selSection === 'header' && (
                <FieldRow label="Show header">
                  <Toggle
                    on={landing.showHeader !== false}
                    onChange={(on) => patchLanding({ showHeader: on })}
                    label="Show header"
                  />
                </FieldRow>
              )}

              {selSection === 'leadform' && (
                <>
                  <p className="mt-3 text-xs text-muted">
                    Shown when a visitor clicks a call-to-action button, before the questions start.
                  </p>
                  <FieldLabel>Heading</FieldLabel>
                  <TextInput
                    value={config.leadForm.heading}
                    onChange={(e) => patch({ leadForm: { ...config.leadForm, heading: e.target.value } })}
                  />
                  <FieldLabel>Submit button label</FieldLabel>
                  <TextInput
                    value={config.leadForm.submitLabel}
                    onChange={(e) => patch({ leadForm: { ...config.leadForm, submitLabel: e.target.value } })}
                  />
                  <p className="mt-4 text-xs text-muted">
                    Fields are managed in <Link href="/admin/settings/lead-form" className="text-primary hover:underline">Settings → Lead Form</Link>.
                  </p>
                </>
              )}

              {selSection === 'banner' && (
                <>
                  <ActionField
                    value={landing.heroCtaAction}
                    onChange={(a) => patchLanding({ heroCtaAction: a })}
                  />
                  <ImagePicker
                    value={landing.heroImage ?? '/images/hero-report.png'}
                    onChange={(v) => patchLanding({ heroImage: v })}
                  />
                  <p className="mt-6 border-t border-gray-200 pt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                    Section style
                  </p>
                  <FieldLabel>Image position</FieldLabel>
                  <SelectInput
                    value={landing.imagePosition ?? 'right'}
                    onChange={(e) => patchLanding({ imagePosition: e.target.value as 'left' | 'right' })}
                  >
                    <option value="right">Right</option>
                    <option value="left">Left</option>
                  </SelectInput>
                </>
              )}

              {selSection === 'categories' && selCard == null && (
                <>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted">Section style</p>
                  <FieldLabel>Categories per row</FieldLabel>
                  <SelectInput
                    value={String(landing.categoriesPerRow ?? 2)}
                    onChange={(e) => patchLanding({ categoriesPerRow: Number(e.target.value) })}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </SelectInput>
                  <p className="mt-4 text-xs text-muted">Select a category in the list or preview to edit it.</p>
                </>
              )}

              {selSection === 'categories' && selCard != null && landing.categoryCards[selCard] && (
                <>
                  <ImagePicker
                    label="Category image"
                    value={landing.categoryCards[selCard].image}
                    onChange={(v) => patchCard(selCard, { image: v })}
                  />
                  <button
                    onClick={() => {
                      if (landing.categoryCards.length <= 1) return alert('Keep at least one category.');
                      patchLanding({ categoryCards: landing.categoryCards.filter((_, j) => j !== selCard) });
                      setSelCard(null);
                    }}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-tier-low py-2.5 text-sm font-medium text-tier-low hover:bg-red-50"
                  >
                    <TrashIcon /> Remove Category
                  </button>
                </>
              )}

              {selSection === 'cta' && (
                <>
                  <ActionField
                    value={landing.bottomCtaAction}
                    onChange={(a) => patchLanding({ bottomCtaAction: a })}
                  />
                  <p className="mt-4 text-xs text-muted">Edit the heading, body and button text directly in the preview.</p>
                </>
              )}

              {selSection === 'footer' && (
                <>
                  <FieldRow label="Show footer">
                    <Toggle
                      on={landing.showFooter !== false}
                      onChange={(on) => patchLanding({ showFooter: on })}
                      label="Show footer"
                    />
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
