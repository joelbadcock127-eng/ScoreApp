'use client';

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ScorecardConfig } from '@/lib/types';
import {
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
type Section = 'header' | 'leadform' | 'banner' | 'categories' | 'cta' | 'footer';

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

  const landing = config.landing;

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

  const SECTION_ROWS: { key: Section; label: string; hideable?: boolean; shown?: boolean }[] = [
    { key: 'header', label: 'Header', hideable: true, shown: landing.showHeader !== false },
    { key: 'leadform', label: 'Lead Form Popup' },
    { key: 'banner', label: 'Banner' },
    { key: 'categories', label: `Categories ${landing.categoryCards.length}` },
    { key: 'cta', label: 'Call to Action' },
    { key: 'footer', label: 'Footer', hideable: true, shown: landing.showFooter !== false },
  ];

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
          <RailButton label="Add section" onClick={() => alert('Custom sections are on the roadmap.')}>
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
                {SECTION_ROWS.map((s) => (
                  <div key={s.key}>
                    <div
                      onClick={() => select(s.key)}
                      className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-sm ${
                        selSection === s.key && selCard == null ? 'bg-gray-200/70' : 'hover:bg-gray-100'
                      } ${s.hideable && !s.shown ? 'text-muted' : ''}`}
                    >
                      <span>{s.label}</span>
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

            {/* Banner / hero */}
            <div
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

            {/* Categories */}
            <div onClick={() => select('categories')} className={`px-8 py-12 ${outline('categories')}`}>
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

            {/* Call to action */}
            <div onClick={() => select('cta')} className={`px-8 py-16 text-center ${outline('cta')}`}>
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
                  : SECTION_ROWS.find((s) => s.key === selSection)?.label}
              </p>

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
                  <FieldLabel>Button action</FieldLabel>
                  <SelectInput value="lead-form" onChange={() => {}}>
                    <option value="lead-form">Open Lead Form</option>
                  </SelectInput>
                  <FieldLabel>Image URL</FieldLabel>
                  <TextInput
                    value={landing.heroImage ?? '/images/hero-report.png'}
                    onChange={(e) => patchLanding({ heroImage: e.target.value })}
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
                  <FieldLabel>Category image URL</FieldLabel>
                  <TextInput
                    value={landing.categoryCards[selCard].image}
                    onChange={(e) => patchCard(selCard, { image: e.target.value })}
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
                  <FieldLabel>Button action</FieldLabel>
                  <SelectInput value="lead-form" onChange={() => {}}>
                    <option value="lead-form">Open Lead Form</option>
                  </SelectInput>
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
