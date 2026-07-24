'use client';

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PdfConfig, ScorecardConfig } from '@/lib/types';
import { tierFor } from '@/lib/scoring';
import {
  ColorField,
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

type Rail = 'pages' | 'theme' | 'page';
type PageKey = 'cover' | 'howToRead' | 'keys' | `cat:${string}` | 'closing';
type Selection = { page: PageKey; child?: string };

const NAVY = '#152042';

// ScoreApp-style PDF report editor: pages tree on the left, paginated WYSIWYG
// preview in the middle, per-page logic/content settings on the right.
export default function PdfEditor({ initialConfig }: { initialConfig: ScorecardConfig }) {
  const router = useRouter();
  const [config, setConfig] = useState<ScorecardConfig>(initialConfig);
  const [rail, setRail] = useState<Rail>('pages');
  const [sel, setSel] = useState<Selection>({ page: 'cover' });
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const sortedTiers = useMemo(() => [...config.tiers].sort((a, b) => a.from - b.from), [config.tiers]);
  const [editTierKey, setEditTierKey] = useState(sortedTiers[0]?.key ?? 'low');

  const pdf: PdfConfig = config.pdf;
  const hidden = pdf.hidden ?? [];
  const images = pdf.images ?? {};
  const panel = pdf.panel ?? { background: NAVY, buttonColor: '#1c78fe', imagePosition: 'left' as const };
  const editTier = config.tiers.find((t) => t.key === editTierKey) ?? config.tiers[0];

  const sample = useMemo(() => {
    const mid = Math.round((editTier.from + editTier.to) / 2);
    const clamp = (v: number) => Math.max(editTier.from, Math.min(editTier.to, v));
    return config.categories.map((c, i) => ({
      key: c.key,
      label: c.label,
      percent: clamp(mid + [-3, 3, -6, 8][i % 4]),
    }));
  }, [editTier, config.categories]);

  function patch(p: Partial<ScorecardConfig>) {
    setConfig((c) => ({ ...c, ...p }));
    setDirty(true);
  }
  function patchPdf(p: Partial<PdfConfig>) {
    patch({ pdf: { ...pdf, ...p } });
  }
  function setImage(key: 'cover' | 'howToRead' | 'closing', url: string) {
    patchPdf({ images: { ...images, [key]: url } });
  }
  function setCategoryImage(cat: string, url: string) {
    patchPdf({ images: { ...images, categories: { ...(images.categories ?? {}), [cat]: url } } });
  }
  function patchCatContent(cat: string, p: Partial<{ intro: string[]; exampleTitle: string; example: string[] }>) {
    const cur = pdf.categories[cat]?.[editTierKey] ?? { intro: [], exampleTitle: '', example: [] };
    patchPdf({
      categories: {
        ...pdf.categories,
        [cat]: { ...(pdf.categories[cat] ?? {}), [editTierKey]: { ...cur, ...p } },
      },
    });
  }
  function patchKeysText(cat: string, html: string) {
    patch({
      results: {
        ...config.results,
        categoryTexts: {
          ...config.results.categoryTexts,
          [cat]: { ...(config.results.categoryTexts[cat] ?? {}), [editTierKey]: html },
        },
      },
    });
  }

  const isHidden = (k: PageKey) => hidden.includes(k);
  function toggleHidden(k: PageKey) {
    patchPdf({ hidden: isHidden(k) ? hidden.filter((x) => x !== k) : [...hidden, k] });
  }
  function removePage(k: PageKey) {
    if (!confirm('Remove this page from the report? You can re-add it with “Add Page”.')) return;
    patchPdf({ hidden: [...hidden, k] });
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
        pdf: config.pdf,
        results: config.results,
        categories: config.categories,
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

  function select(page: PageKey, child?: string, scroll = false) {
    setSel({ page, child });
    if (rail !== 'pages') setRail('pages');
    if (scroll) {
      setTimeout(() => {
        document.getElementById(`pdf-page-${page.replace(':', '-')}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }

  // Page list in render order, with display numbers over visible pages only.
  const allPages: { key: PageKey; label: string }[] = [
    { key: 'cover', label: 'Cover' },
    { key: 'howToRead', label: 'How to read' },
    { key: 'keys', label: 'Scores summary' },
    ...config.categories.map((c) => ({ key: `cat:${c.key}` as PageKey, label: c.label })),
    { key: 'closing', label: 'Closing' },
  ];
  const visiblePages = allPages.filter((p) => !isHidden(p.key));
  const pageNo = (k: PageKey) => visiblePages.findIndex((p) => p.key === k) + 1;
  const hiddenPages = allPages.filter((p) => isHidden(p.key));

  const outline = (k: PageKey) =>
    `cursor-pointer transition ${
      rail === 'pages' && sel.page === k
        ? 'outline outline-2 outline-primary'
        : 'outline outline-1 outline-transparent hover:outline-primary/40'
    }`;

  function TierPicker() {
    return (
      <>
        <FieldRow label="Dynamic content">
          <Toggle on onChange={() => alert('Dynamic content keeps a copy of this text per score tier.')} label="Dynamic content" />
        </FieldRow>
        <p className="mt-2 text-sm text-ink">You are currently editing</p>
        <div className="relative mt-1">
          <span
            className="pointer-events-none absolute left-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: editTier.color }}
          />
          <SelectInput className="!pl-8" value={editTierKey} onChange={(e) => setEditTierKey(e.target.value)}>
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

  function RemovePageButton({ k }: { k: PageKey }) {
    return (
      <button
        onClick={() => removePage(k)}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-tier-low py-2.5 text-sm font-medium text-tier-low hover:bg-red-50"
      >
        <TrashIcon /> Remove Page
      </button>
    );
  }

  function OverrideRows() {
    return (
      <div className="mt-6 border-t border-gray-200 text-xs font-semibold uppercase tracking-wide text-ink">
        <div className="flex items-center justify-between border-b border-gray-100 py-3">
          Content settings <span className="text-muted">›</span>
        </div>
        <div className="flex items-center justify-between border-b border-gray-100 py-3">
          Override default page styles <span className="text-muted">›</span>
        </div>
        <div className="flex items-center justify-between py-3">
          Override default header &amp; footer settings <span className="text-muted">›</span>
        </div>
      </div>
    );
  }

  const footerText = pdf.footerText || config.title;
  const pageShell = 'relative mx-auto w-full max-w-[640px] shadow-card';

  function FooterBar({ n }: { n: number }) {
    return (
      <div className="flex items-center justify-between px-8 pb-3 text-[10px] text-muted">
        <RichText
          value={pdf.footerText ?? ''}
          onChange={(v) => patchPdf({ footerText: v })}
          placeholder="+ ADD FOOTER TEXT"
          className="min-w-[120px]"
        />
        <span>{n}</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-gray-100">
      <TopBar
        title={config.title}
        content="pdf"
        device={device}
        setDevice={setDevice}
        dirty={dirty}
        saving={saving}
        onSave={save}
      />

      {config.mode === 'survey' && (
        <p className="border-b border-blue-100 bg-blue-50 px-6 py-2 text-center text-sm text-ink">
          Survey mode: respondents never receive the PDF report — the report link is disabled while this scorecard is
          a survey, so this page only matters if you switch back to scorecard mode.
        </p>
      )}

      <div className="flex min-h-0 flex-1">
        {/* Icon rail */}
        <div className="flex w-[72px] flex-none flex-col items-center gap-1 border-r border-gray-200 bg-white py-3">
          <RailButton label="Add page" onClick={() => alert('Removed pages can be re-added with “Add Page” in the Sections panel.')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </RailButton>
          <RailButton label="Pages" active={rail === 'pages'} onClick={() => setRail('pages')}>
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
          {rail === 'pages' && (
            <>
              <p className="flex-none px-5 pb-2 pt-4 text-lg font-semibold">Sections</p>
              <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
                {visiblePages.map((p) => (
                  <div key={p.key}>
                    <div
                      onClick={() => select(p.key, undefined, true)}
                      className={`group flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-sm ${
                        sel.page === p.key && !sel.child ? 'bg-gray-200/70' : 'hover:bg-gray-100'
                      }`}
                    >
                      <span>Page {pageNo(p.key)}</span>
                      <span className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleHidden(p.key);
                          }}
                          className="hidden text-muted hover:text-ink group-hover:block"
                          aria-label={`Hide ${p.label}`}
                        >
                          <EyeIcon />
                        </button>
                      </span>
                    </div>
                    {p.key === 'cover' && (
                      <div className="ml-6 border-l border-gray-100 pl-2">
                        {['Cover Item', 'Cover Item'].map((label, i) => (
                          <div
                            key={i}
                            onClick={() => select('cover', `item${i}`, true)}
                            className={`cursor-pointer rounded-md px-3 py-2 text-sm ${
                              sel.page === 'cover' && sel.child === `item${i}` ? 'bg-gray-200/70' : 'hover:bg-gray-100'
                            }`}
                          >
                            {label}
                          </div>
                        ))}
                        <button
                          onClick={() => alert('Extra cover items are on the roadmap.')}
                          className="px-3 py-2 text-sm font-medium text-primary hover:underline"
                        >
                          ⊕ Add Cover Item
                        </button>
                      </div>
                    )}
                    {p.key === 'keys' && (
                      <div className="ml-6 border-l border-gray-100 pl-2">
                        {config.categories.map((c) => (
                          <div
                            key={c.key}
                            onClick={() => select('keys', c.key, true)}
                            className={`cursor-pointer rounded-md px-3 py-2 text-sm ${
                              sel.page === 'keys' && sel.child === c.key ? 'bg-gray-200/70' : 'hover:bg-gray-100'
                            }`}
                          >
                            {c.label}
                          </div>
                        ))}
                      </div>
                    )}
                    {p.key === 'closing' && (
                      <div className="ml-6 border-l border-gray-100 pl-2">
                        <div
                          onClick={() => select('closing', 'panel', true)}
                          className={`cursor-pointer rounded-md px-3 py-2 text-sm ${
                            sel.page === 'closing' && sel.child === 'panel' ? 'bg-gray-200/70' : 'hover:bg-gray-100'
                          }`}
                        >
                          Panel
                        </div>
                        <button
                          onClick={() => alert('Extra panels are on the roadmap.')}
                          className="px-3 py-2 text-sm font-medium text-primary hover:underline"
                        >
                          ⊕ Add Panel
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {hiddenPages.length > 0 && (
                  <div className="mt-2 px-3">
                    <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted">Add Page</p>
                    {hiddenPages.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => toggleHidden(p.key)}
                        className="block py-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        ⊕ {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {rail === 'theme' && <ThemePanel branding={config.branding} onChange={(b) => patch({ branding: b })} />}

          {rail === 'page' && (
            <div className="overflow-y-auto px-5 py-4">
              <p className="text-lg font-semibold">Page Settings</p>
              <FieldLabel>Report footer text</FieldLabel>
              <TextInput
                value={pdf.footerText ?? ''}
                placeholder={config.title}
                onChange={(e) => patchPdf({ footerText: e.target.value })}
              />
              <FieldLabel>Scorecard title</FieldLabel>
              <TextInput value={config.title} onChange={(e) => patch({ title: e.target.value })} />
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="min-w-0 flex-1 overflow-y-auto p-5">
          <div className={`mx-auto ${device === 'mobile' ? 'max-w-[420px]' : 'max-w-[720px]'}`}>
            {/* Cover */}
            {!isHidden('cover') && (
              <>
                <div className="mb-2 flex items-center gap-3 text-xs text-muted">
                  <span className="h-px flex-1 bg-gray-300" /> Page {pageNo('cover')} <span className="h-px flex-1 bg-gray-300" />
                </div>
                <div
                  id="pdf-page-cover"
                  onClick={() => select('cover')}
                  className={`${pageShell} ${outline('cover')}`}
                  style={{ backgroundColor: NAVY, aspectRatio: '1 / 1.414', paddingTop: 24, paddingLeft: 44, paddingRight: 44 }}
                >
                  <div className="flex h-full flex-col bg-white px-6 pt-6">
                    <RichText
                      value={pdf.coverTitle}
                      onChange={(v) => patchPdf({ coverTitle: v })}
                      className="text-center text-3xl font-bold leading-tight"
                    />
                    <div className="relative mt-5 flex-1 overflow-hidden">
                      {images.cover ? (
                        <img src={images.cover} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#eef1f7]">
                          <img src={config.branding.logoUrl} alt="" className="h-28 w-auto object-contain" />
                        </div>
                      )}
                      <div className="absolute bottom-16 left-0 right-0 flex flex-col items-center gap-3">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            select('cover', 'item0');
                          }}
                          className={`min-w-[170px] bg-white px-6 py-2 text-center text-sm text-ink ${
                            sel.page === 'cover' && sel.child === 'item0' ? 'outline outline-2 outline-primary' : ''
                          }`}
                        >
                          John Smith
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            select('cover', 'item1');
                          }}
                          className={`min-w-[170px] bg-white px-6 py-2 text-center text-sm text-ink ${
                            sel.page === 'cover' && sel.child === 'item1' ? 'outline outline-2 outline-primary' : ''
                          }`}
                        >
                          {new Date().toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* How to read */}
            {!isHidden('howToRead') && (
              <>
                <div className="my-3 flex items-center gap-3 text-xs text-muted">
                  <span className="h-px flex-1 bg-gray-300" /> Page {pageNo('howToRead')} <span className="h-px flex-1 bg-gray-300" />
                </div>
                <div
                  id="pdf-page-howToRead"
                  onClick={() => select('howToRead')}
                  className={`${pageShell} ${outline('howToRead')}`}
                  style={{ backgroundColor: NAVY, padding: 14, aspectRatio: '1 / 1.414' }}
                >
                  <div className="flex h-full flex-col overflow-hidden bg-white px-8 pt-8">
                    <RichText
                      value={pdf.howToReadTitle}
                      onChange={(v) => patchPdf({ howToReadTitle: v })}
                      className="text-2xl font-bold leading-snug"
                    />
                    <div className="mt-3">
                      {pdf.howToRead.map((p, i) => (
                        <div key={i} className="group relative">
                          <RichText
                            value={p}
                            onChange={(v) => patchPdf({ howToRead: pdf.howToRead.map((x, j) => (j === i ? v : x)) })}
                            className={`mb-2 text-[11px] leading-relaxed ${i === 0 ? 'font-bold text-ink' : 'text-muted'}`}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              patchPdf({ howToRead: pdf.howToRead.filter((_, j) => j !== i) });
                            }}
                            className="absolute -right-5 top-0 hidden text-muted hover:text-tier-low group-hover:block"
                            aria-label="Remove paragraph"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          patchPdf({ howToRead: [...pdf.howToRead, 'New paragraph'] });
                        }}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        + Add paragraph
                      </button>
                    </div>
                    <div className="mt-3 min-h-0 flex-1 overflow-hidden">
                      {images.howToRead ? (
                        <img src={images.howToRead} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gray-100 text-xs text-muted">
                          Add an image in the panel on the right
                        </div>
                      )}
                    </div>
                    <FooterBar n={pageNo('howToRead')} />
                  </div>
                </div>
              </>
            )}

            {/* Keys summary */}
            {!isHidden('keys') && (
              <>
                <div className="my-3 flex items-center gap-3 text-xs text-muted">
                  <span className="h-px flex-1 bg-gray-300" /> Page {pageNo('keys')} <span className="h-px flex-1 bg-gray-300" />
                </div>
                <div
                  id="pdf-page-keys"
                  onClick={() => select('keys')}
                  className={`${pageShell} ${outline('keys')}`}
                  style={{ backgroundColor: NAVY, padding: 14 }}
                >
                  <div className="bg-white px-8 py-8">
                    <RichText
                      value={pdf.keysHeading}
                      onChange={(v) => patchPdf({ keysHeading: v })}
                      className="max-w-md text-2xl font-bold leading-snug"
                    />
                    <div className="mt-5 space-y-5">
                      {sample.map((c) => {
                        const t = tierFor(c.percent, config.tiers);
                        const cat = config.categories.find((x) => x.key === c.key);
                        return (
                          <div
                            key={c.key}
                            onClick={(e) => {
                              e.stopPropagation();
                              select('keys', c.key);
                            }}
                            className={`flex gap-4 ${
                              sel.page === 'keys' && sel.child === c.key ? 'outline outline-2 outline-primary' : ''
                            }`}
                          >
                            <div className="w-[72px] flex-none text-center">
                              <div
                                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white"
                                style={{ border: `5px solid ${t.color}` }}
                              >
                                {cat?.icon && !cat.icon.startsWith('/') && !cat.icon.startsWith('http') ? (
                                  <span className="text-lg">{cat.icon}</span>
                                ) : cat?.icon ? (
                                  <img src={cat.icon} alt="" className="h-7 w-7 object-contain" />
                                ) : (
                                  <span className="text-sm font-bold" style={{ color: t.color }}>
                                    {c.percent}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm font-bold text-ink">{c.percent}%</p>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold">{c.label}</p>
                              <RichText
                                value={config.results.categoryTexts[c.key]?.[editTierKey] ?? ''}
                                onChange={(v) => patchKeysText(c.key, v)}
                                className="mt-1 text-[10.5px] leading-relaxed text-muted"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <FooterBar n={pageNo('keys')} />
                  </div>
                </div>
              </>
            )}

            {/* Category pages */}
            {config.categories.map((cat) => {
              const key = `cat:${cat.key}` as PageKey;
              if (isHidden(key)) return null;
              const c = sample.find((x) => x.key === cat.key)!;
              const t = tierFor(c.percent, config.tiers);
              const content = pdf.categories[cat.key]?.[editTierKey] ?? { intro: [], exampleTitle: '', example: [] };
              const hero = images.categories?.[cat.key];
              return (
                <div key={cat.key}>
                  <div className="my-3 flex items-center gap-3 text-xs text-muted">
                    <span className="h-px flex-1 bg-gray-300" /> Page {pageNo(key)} <span className="h-px flex-1 bg-gray-300" />
                  </div>
                  <div
                    id={`pdf-page-${key.replace(':', '-')}`}
                    onClick={() => select(key)}
                    className={`${pageShell} ${outline(key)}`}
                    style={{ backgroundColor: NAVY, padding: 14 }}
                  >
                    <div className="overflow-hidden bg-white">
                      <div className="relative h-32">
                        {hero ? (
                          <img src={hero} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full" style={{ backgroundColor: NAVY, opacity: 0.92 }} />
                        )}
                        <div className="absolute right-7 top-10 flex w-[120px] flex-col items-center bg-white/95 py-3">
                          <div
                            className="flex h-16 w-16 items-center justify-center rounded-full"
                            style={{ backgroundColor: t.color }}
                          >
                            <span className="text-lg font-bold text-white">{c.percent}%</span>
                          </div>
                          <span className="mt-2 text-[9px] tracking-[3px] text-muted">YOU SCORED</span>
                        </div>
                      </div>
                      <div className="px-8 pb-2 pt-5">
                        <h2 className="max-w-xs text-2xl font-bold">{cat.label}</h2>
                        <div className="mt-3">
                          {content.intro.map((p, i) => (
                            <div key={i} className="group relative">
                              <RichText
                                value={p}
                                onChange={(v) =>
                                  patchCatContent(cat.key, { intro: content.intro.map((x, j) => (j === i ? v : x)) })
                                }
                                className="mb-2 text-[10.5px] leading-relaxed text-muted"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  patchCatContent(cat.key, { intro: content.intro.filter((_, j) => j !== i) });
                                }}
                                className="absolute -right-5 top-0 hidden text-muted hover:text-tier-low group-hover:block"
                                aria-label="Remove paragraph"
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              patchCatContent(cat.key, { intro: [...content.intro, 'New paragraph'] });
                            }}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            + Add paragraph
                          </button>
                          <RichText
                            value={content.exampleTitle}
                            onChange={(v) => patchCatContent(cat.key, { exampleTitle: v })}
                            className="mb-2 mt-3 text-sm font-bold"
                          />
                          {content.example.map((p, i) => (
                            <div key={i} className="group relative">
                              <RichText
                                value={p}
                                onChange={(v) =>
                                  patchCatContent(cat.key, { example: content.example.map((x, j) => (j === i ? v : x)) })
                                }
                                className="mb-2 text-[10.5px] leading-relaxed text-muted"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  patchCatContent(cat.key, { example: content.example.filter((_, j) => j !== i) });
                                }}
                                className="absolute -right-5 top-0 hidden text-muted hover:text-tier-low group-hover:block"
                                aria-label="Remove paragraph"
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              patchCatContent(cat.key, { example: [...content.example, 'New paragraph'] });
                            }}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            + Add paragraph
                          </button>
                        </div>
                        <FooterBar n={pageNo(key)} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Closing */}
            {!isHidden('closing') && (
              <>
                <div className="my-3 flex items-center gap-3 text-xs text-muted">
                  <span className="h-px flex-1 bg-gray-300" /> Page {pageNo('closing')} <span className="h-px flex-1 bg-gray-300" />
                </div>
                <div
                  id="pdf-page-closing"
                  onClick={() => select('closing')}
                  className={`${pageShell} ${outline('closing')}`}
                  style={{ backgroundColor: NAVY, padding: 14, aspectRatio: '1 / 1.414' }}
                >
                  <div className="relative h-full overflow-hidden bg-white">
                    {images.closing ? (
                      <img src={images.closing} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-start justify-center bg-gray-100 pt-24 text-xs text-muted">
                        Add a background image in the panel on the right
                      </div>
                    )}
                    <span className={`absolute left-5 top-4 text-[11px] ${images.closing ? 'text-white' : 'text-ink'}`}>
                      {footerText}
                    </span>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        select('closing', 'panel');
                      }}
                      className={`absolute bottom-8 w-[62%] p-6 ${panel.imagePosition === 'right' ? 'right-5' : 'left-5'} ${
                        sel.page === 'closing' && sel.child === 'panel' ? 'outline outline-2 outline-primary' : ''
                      }`}
                      style={{ backgroundColor: panel.background }}
                    >
                      <RichText
                        value={pdf.closingTitle}
                        onChange={(v) => patchPdf({ closingTitle: v })}
                        className="text-xl font-bold leading-snug text-white"
                      />
                      <div className="mt-3">
                        {pdf.closing.map((p, i) => (
                          <RichText
                            key={i}
                            value={p}
                            onChange={(v) => patchPdf({ closing: pdf.closing.map((x, j) => (j === i ? v : x)) })}
                            className="mb-2 text-[10.5px] leading-relaxed text-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                    <span className={`absolute bottom-3 right-4 text-[10px] ${images.closing ? 'text-white' : 'text-muted'}`}>
                      {pageNo('closing')}
                    </span>
                  </div>
                </div>
              </>
            )}
            <div className="h-8" />
          </div>
        </div>

        {/* Right pane */}
        <div className="w-[310px] flex-none overflow-y-auto border-l border-gray-200 bg-white px-5 py-4">
          {rail === 'pages' ? (
            <>
              {sel.page === 'cover' && !sel.child && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Logic</p>
                  <FieldRow label="Dynamic content">
                    <Toggle on={false} onChange={() => alert('The cover page is the same for every tier.')} label="Dynamic content" />
                  </FieldRow>
                  <p className="mt-4 border-t border-gray-200 pt-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    Content
                  </p>
                  <ImagePicker value={images.cover ?? ''} onChange={(v) => setImage('cover', v)} />
                  <OverrideRows />
                  <RemovePageButton k="cover" />
                </>
              )}

              {sel.page === 'cover' && sel.child && (
                <>
                  <p className="border-b border-gray-200 pb-2 text-xs font-semibold uppercase tracking-wide">Cover Item</p>
                  <p className="mt-3 text-sm text-muted">
                    This box shows dynamic content — the {sel.child === 'item0' ? 'lead’s name' : 'report date'} is filled in
                    automatically for each report.
                  </p>
                </>
              )}

              {sel.page === 'howToRead' && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Logic</p>
                  <FieldRow label="Dynamic content">
                    <Toggle on={false} onChange={() => alert('This page is the same for every tier.')} label="Dynamic content" />
                  </FieldRow>
                  <p className="mt-4 border-t border-gray-200 pt-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    Content
                  </p>
                  <ImagePicker value={images.howToRead ?? ''} onChange={(v) => setImage('howToRead', v)} />
                  <OverrideRows />
                  <RemovePageButton k="howToRead" />
                </>
              )}

              {sel.page === 'keys' && !sel.child && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Logic</p>
                  <TierPicker />
                  <OverrideRows />
                  <RemovePageButton k="keys" />
                </>
              )}

              {sel.page === 'keys' && sel.child && (
                <>
                  <p className="border-b border-gray-200 pb-2 text-xs font-semibold uppercase tracking-wide">
                    {config.categories.find((c) => c.key === sel.child)?.label}
                  </p>
                  <TierPicker />
                  <FieldLabel>Score image (emoji or image URL)</FieldLabel>
                  <TextInput
                    value={config.categories.find((c) => c.key === sel.child)?.icon ?? ''}
                    placeholder="e.g. 📈 or /images/icon.png"
                    onChange={(e) =>
                      patch({
                        categories: config.categories.map((c) =>
                          c.key === sel.child ? { ...c, icon: e.target.value } : c
                        ),
                      })
                    }
                  />
                </>
              )}

              {sel.page.startsWith('cat:') && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Logic</p>
                  <FieldLabel>Page Category</FieldLabel>
                  <SelectInput value={sel.page.slice(4)} onChange={(e) => select(`cat:${e.target.value}` as PageKey)}>
                    {config.categories.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </SelectInput>
                  <TierPicker />
                  <p className="mt-4 border-t border-gray-200 pt-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    Content
                  </p>
                  <ImagePicker
                    value={images.categories?.[sel.page.slice(4)] ?? ''}
                    onChange={(v) => setCategoryImage(sel.page.slice(4), v)}
                  />
                  <OverrideRows />
                  <RemovePageButton k={sel.page} />
                </>
              )}

              {sel.page === 'closing' && !sel.child && (
                <>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Logic</p>
                  <FieldRow label="Dynamic content">
                    <Toggle on={false} onChange={() => alert('This page is the same for every tier.')} label="Dynamic content" />
                  </FieldRow>
                  <p className="mt-4 border-t border-gray-200 pt-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    Content
                  </p>
                  <ImagePicker value={images.closing ?? ''} onChange={(v) => setImage('closing', v)} />
                  <OverrideRows />
                  <RemovePageButton k="closing" />
                </>
              )}

              {sel.page === 'closing' && sel.child === 'panel' && (
                <>
                  <p className="border-b border-gray-200 pb-2 text-xs font-semibold uppercase tracking-wide">Panel</p>
                  <FieldRow label="Dynamic content">
                    <Toggle on={false} onChange={() => alert('Dynamic panel content is on the roadmap.')} label="Dynamic content" />
                  </FieldRow>
                  <ImagePicker value={images.closing ?? ''} onChange={(v) => setImage('closing', v)} />
                  <FieldLabel>Panel image position</FieldLabel>
                  <SelectInput
                    value={panel.imagePosition}
                    onChange={(e) =>
                      patchPdf({ panel: { ...panel, imagePosition: e.target.value as 'left' | 'right' } })
                    }
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </SelectInput>
                  <FieldLabel>Button action</FieldLabel>
                  <SelectInput value="page" onChange={() => {}}>
                    <option value="page">Go to Page</option>
                  </SelectInput>
                  <FieldLabel>Page</FieldLabel>
                  <SelectInput value="default" onChange={() => {}}>
                    <option value="default">Default PDF</option>
                  </SelectInput>
                  <ColorField
                    label="Panel background colour"
                    sub={panel.background}
                    value={panel.background}
                    onChange={(v) => patchPdf({ panel: { ...panel, background: v } })}
                  />
                  <ColorField
                    label="Panel button colour"
                    sub={panel.buttonColor}
                    value={panel.buttonColor}
                    onChange={(v) => patchPdf({ panel: { ...panel, buttonColor: v } })}
                  />
                  <button
                    onClick={() => alert('The closing panel is required — hide the whole page instead.')}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-tier-low py-2.5 text-sm font-medium text-tier-low hover:bg-red-50"
                  >
                    <TrashIcon /> Remove Panel
                  </button>
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
