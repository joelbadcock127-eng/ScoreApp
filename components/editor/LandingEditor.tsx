'use client';

/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LandingConfig, ScorecardConfig } from '@/lib/types';
import LandingView, { LandingSectionKey } from '@/components/LandingView';
import EditorShell, { Field, Toggle, inputCls } from './EditorShell';

const SECTION_LIST: { key: LandingSectionKey; label: string }[] = [
  { key: 'header', label: 'Header' },
  { key: 'leadform', label: 'Lead Form Popup' },
  { key: 'banner', label: 'Banner' },
  { key: 'categories', label: 'Categories' },
  { key: 'cta', label: 'Call to Action' },
  { key: 'footer', label: 'Footer' },
];

export default function LandingEditor({ initial }: { initial: ScorecardConfig }) {
  const [landing, setLandingState] = useState<LandingConfig>(initial.landing);
  const [selected, setSelected] = useState<LandingSectionKey>('banner');
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  function setLanding(patch: Partial<LandingConfig>) {
    setLandingState((l) => ({ ...l, ...patch }));
    setDirty(true);
  }

  function updateCard(i: number, patch: Partial<LandingConfig['categoryCards'][number]>) {
    setLanding({
      categoryCards: landing.categoryCards.map((c, j) => (j === i ? { ...c, ...patch } : c)),
    });
  }

  async function uploadImage(file: File, assign: (url: string) => void) {
    setUploading(true);
    const form = new FormData();
    form.set('kind', 'asset');
    form.set('file', file);
    const res = await fetch('/api/admin/branding', { method: 'POST', body: form });
    setUploading(false);
    if (res.ok) {
      const { url } = await res.json();
      assign(url);
    }
  }

  async function save() {
    setSaving(true);
    const res = await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ landing }),
    });
    setSaving(false);
    if (res.ok) {
      setDirty(false);
      router.refresh();
    }
  }

  const card = selectedCard != null ? landing.categoryCards[selectedCard] : null;

  return (
    <EditorShell
      title={initial.title}
      crumb="Landing Pages > Main Landing Page"
      saving={saving}
      dirty={dirty}
      onSave={save}
    >
      {/* Sections panel */}
      <div className="w-[260px] flex-none overflow-y-auto border-r border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Sections</h2>
        <div className="space-y-1">
          {SECTION_LIST.map((s) => (
            <div key={s.key}>
              <button
                onClick={() => {
                  setSelected(s.key);
                  setSelectedCard(null);
                }}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm ${
                  selected === s.key ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
                }`}
              >
                <span className={s.key === 'footer' && !landing.footer.show ? 'text-muted line-through' : ''}>
                  {s.label}
                </span>
                {s.key === 'footer' && (
                  <Toggle checked={landing.footer.show} onChange={(v) => setLanding({ footer: { show: v } })} />
                )}
              </button>
              {s.key === 'categories' && selected === 'categories' && (
                <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-2">
                  {landing.categoryCards.map((c, i) => (
                    <button
                      key={c.key + i}
                      onClick={() => setSelectedCard(i)}
                      className={`block w-full rounded px-2 py-1.5 text-left text-sm ${
                        selectedCard === i ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
                      }`}
                    >
                      {c.title || 'Category'}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setLanding({
                        categoryCards: [
                          ...landing.categoryCards,
                          { key: `card-${Date.now()}`, title: 'New category', body: '', image: '/images/icon.png' },
                        ],
                      });
                      setSelectedCard(landing.categoryCards.length);
                    }}
                    className="block w-full px-2 py-1.5 text-left text-sm font-medium text-primary hover:underline"
                  >
                    + Add Category
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="min-w-0 flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-5xl rounded-lg bg-white shadow-card">
          <LandingView
            landing={landing}
            branding={initial.branding}
            copyright={initial.copyright}
            selected={selected}
            onSelect={(s) => {
              setSelected(s);
              if (s !== 'categories') setSelectedCard(null);
            }}
            selectedCard={selectedCard}
            onSelectCard={setSelectedCard}
          />
        </div>
      </div>

      {/* Settings pane */}
      <div className="w-[300px] flex-none overflow-y-auto border-l border-gray-200 bg-white p-4">
        {selected === 'header' && (
          <>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Header</p>
            <Field label="Logo max-width (px)">
              <input
                type="number"
                value={landing.header.logoMaxWidth}
                min={60}
                max={600}
                onChange={(e) => setLanding({ header: { ...landing.header, logoMaxWidth: Number(e.target.value) } })}
                className={inputCls}
              />
            </Field>
            <Field label="Logo alignment">
              <select
                value={landing.header.alignment}
                onChange={(e) => setLanding({ header: { ...landing.header, alignment: e.target.value as 'left' | 'center' | 'right' } })}
                className={inputCls}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </Field>
            <p className="text-xs text-muted">
              Logo image comes from <a href="/admin/settings/branding" className="text-primary hover:underline">Branding settings</a>.
            </p>
          </>
        )}

        {selected === 'leadform' && (
          <>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Lead Form Popup</p>
            <p className="mb-4 text-sm text-muted">
              The popup opens from every scorecard button. Its heading and fields are managed in{' '}
              <a href="/admin/settings/lead-form" className="text-primary hover:underline">Settings → Lead Form</a>.
            </p>
          </>
        )}

        {selected === 'banner' && (
          <>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Banner — Content</p>
            <Field label="Title (use the preview to bold / italicise)">
              <textarea
                value={landing.heroTitle.replace(/<br\s*\/?>/g, '\n')}
                rows={2}
                onChange={(e) => setLanding({ heroTitle: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Subtitle">
              <textarea value={landing.heroSubtitle} rows={2} onChange={(e) => setLanding({ heroSubtitle: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Body">
              <textarea value={landing.heroBody} rows={5} onChange={(e) => setLanding({ heroBody: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Bullets (one per line)">
              <textarea
                value={landing.heroBullets.join('\n')}
                rows={3}
                onChange={(e) => setLanding({ heroBullets: e.target.value.split('\n').filter(Boolean) })}
                className={inputCls}
              />
            </Field>
            <Field label="Button label">
              <input value={landing.heroCta} onChange={(e) => setLanding({ heroCta: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Button action">
              <select disabled className={inputCls}>
                <option>Open Lead Form</option>
              </select>
            </Field>
            <Field label="Image">
              <ImagePicker url={landing.heroImage} uploading={uploading} onPick={(f) => uploadImage(f, (url) => setLanding({ heroImage: url }))} />
            </Field>
            <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-muted">Section style</p>
            <Field label="Image position">
              <select
                value={landing.heroImagePosition}
                onChange={(e) => setLanding({ heroImagePosition: e.target.value as 'left' | 'right' })}
                className={inputCls}
              >
                <option value="right">Right</option>
                <option value="left">Left</option>
              </select>
            </Field>
            <Field label="Section background">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={landing.bannerBackground === 'transparent' ? '#ffffff' : landing.bannerBackground}
                  onChange={(e) => setLanding({ bannerBackground: e.target.value })}
                  className="h-9 w-12 cursor-pointer rounded border border-gray-300"
                />
                <button onClick={() => setLanding({ bannerBackground: 'transparent' })} className="text-xs text-primary hover:underline">
                  transparent
                </button>
              </div>
            </Field>
          </>
        )}

        {selected === 'categories' && !card && (
          <>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Categories — Content</p>
            <Field label="Label">
              <input value={landing.howItWorksLabel} onChange={(e) => setLanding({ howItWorksLabel: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Title">
              <input value={landing.howItWorksTitle} onChange={(e) => setLanding({ howItWorksTitle: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Body">
              <textarea value={landing.howItWorksBody} rows={6} onChange={(e) => setLanding({ howItWorksBody: e.target.value })} className={inputCls} />
            </Field>
            <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-muted">Section style</p>
            <Field label="Categories per row">
              <select
                value={landing.categoriesPerRow}
                onChange={(e) => setLanding({ categoriesPerRow: Number(e.target.value) as 1 | 2 | 4 })}
                className={inputCls}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={4}>4</option>
              </select>
            </Field>
            <p className="text-xs text-muted">Click a card in the preview (or the list) to edit it.</p>
          </>
        )}

        {selected === 'categories' && card && selectedCard != null && (
          <>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Category</p>
            <Field label="Title">
              <input value={card.title} onChange={(e) => updateCard(selectedCard, { title: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Body">
              <textarea value={card.body} rows={5} onChange={(e) => updateCard(selectedCard, { body: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Category image">
              <ImagePicker url={card.image} uploading={uploading} onPick={(f) => uploadImage(f, (url) => updateCard(selectedCard, { image: url }))} />
            </Field>
            <button
              onClick={() => {
                setLanding({ categoryCards: landing.categoryCards.filter((_, i) => i !== selectedCard) });
                setSelectedCard(null);
              }}
              className="mt-2 rounded-md border border-tier-low px-4 py-2 text-sm font-medium text-tier-low hover:bg-red-50"
            >
              Remove Category
            </button>
          </>
        )}

        {selected === 'cta' && (
          <>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Call to Action</p>
            <Field label="Title">
              <input value={landing.bottomTitle} onChange={(e) => setLanding({ bottomTitle: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Body">
              <textarea value={landing.bottomBody} rows={4} onChange={(e) => setLanding({ bottomBody: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Button label">
              <input value={landing.bottomCta} onChange={(e) => setLanding({ bottomCta: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Note">
              <input value={landing.bottomNote} onChange={(e) => setLanding({ bottomNote: e.target.value })} className={inputCls} />
            </Field>
          </>
        )}

        {selected === 'footer' && (
          <>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Footer</p>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium">Show footer</p>
              <Toggle checked={landing.footer.show} onChange={(v) => setLanding({ footer: { show: v } })} />
            </div>
            <p className="text-xs text-muted">
              Logo comes from Branding settings; the copyright text lives in the scorecard config.
            </p>
          </>
        )}
      </div>
    </EditorShell>
  );
}

function ImagePicker({
  url,
  uploading,
  onPick,
}: {
  url: string;
  uploading: boolean;
  onPick: (f: File) => void;
}) {
  return (
    <label className="flex h-24 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:border-primary">
      {uploading ? (
        <span className="text-sm text-muted">Uploading…</span>
      ) : url ? (
        <img src={url} alt="" className="max-h-full max-w-full object-contain" />
      ) : (
        <span className="text-sm text-muted">Select image</span>
      )}
      <input
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = '';
        }}
      />
    </label>
  );
}
