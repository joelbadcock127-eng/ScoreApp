'use client';

/* eslint-disable @next/next/no-img-element */
import { ExtraSection, ExtraSectionItem, ScorecardConfig } from '@/lib/types';
import { Stars, videoEmbedUrl } from '@/components/ExtraSectionView';
import { stripTags } from '@/lib/richtext';
import InlineLeadForm from '@/components/InlineLeadForm';
import { RichText, TrashIcon } from './ui';

const NAVY = '#152042';

function initials(name: string) {
  const words = stripTags(name).trim().split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase() || '★';
}

// Editor-preview twin of ExtraSectionView: the exact same designs, but every
// text element inside is an inline RichText, and list items can be added or
// removed right in the preview.
export default function ExtraSectionEditable({
  section: s,
  config,
  onPatch,
}: {
  section: ExtraSection;
  config: ScorecardConfig;
  onPatch: (p: Partial<ExtraSection>) => void;
}) {
  const primary = config.branding.primaryColor;

  const patchItem = (i: number, p: Partial<ExtraSectionItem>) =>
    onPatch({ items: (s.items ?? []).map((x, j) => (j === i ? { ...x, ...p } : x)) });
  const removeItem = (i: number) => onPatch({ items: (s.items ?? []).filter((_, j) => j !== i) });
  const addItem = (item: ExtraSectionItem) => onPatch({ items: [...(s.items ?? []), item] });

  const title = (cls: string, extra?: React.CSSProperties) => (
    <RichText value={s.title ?? ''} onChange={(title) => onPatch({ title })} className={cls} style={extra} placeholder="Add a title" />
  );
  const body = (cls: string) => (
    <RichText value={s.body ?? ''} onChange={(body) => onPatch({ body })} className={cls} placeholder="Add supporting text" />
  );
  const button = (cls: string) =>
    s.button != null && s.button !== '' ? (
      <div className="mt-8">
        <RichText
          value={s.button}
          onChange={(b) => onPatch({ button: b })}
          className={cls}
          style={{ backgroundColor: primary }}
        />
      </div>
    ) : null;
  const btnCls = 'inline-block rounded-lg px-10 py-3.5 text-lg font-medium text-white shadow-lg';

  if (s.type === 'banner2') {
    return (
      <section
        className="relative overflow-hidden px-6 py-20"
        style={{ background: `linear-gradient(120deg, ${NAVY} 0%, #1d2c5e 60%, #24398f 100%)` }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: primary }}
        />
        <div className={`relative mx-auto grid max-w-6xl items-center gap-12 ${s.image ? 'md:grid-cols-2' : 'text-center'}`}>
          <div>
            {title('text-3xl font-bold leading-tight text-white md:text-5xl')}
            {body('mt-6 text-lg leading-relaxed text-gray-300')}
            {button(btnCls)}
          </div>
          {s.image && (
            <div className="flex justify-center">
              <img src={s.image} alt="" className="w-full max-w-[460px] rounded-2xl shadow-2xl ring-1 ring-white/10" />
            </div>
          )}
        </div>
      </section>
    );
  }

  if (s.type === 'form') {
    return (
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
          <div>
            {title('text-3xl font-bold leading-tight md:text-4xl')}
            {body('mt-5 text-lg leading-relaxed text-muted')}
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-xl">
            <InlineLeadForm leadForm={config.leadForm} disabled />
          </div>
        </div>
      </section>
    );
  }

  if (s.type === 'cta2') {
    return (
      <section className="px-6 py-16">
        <div
          className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl px-6 py-16 text-center"
          style={{ background: `linear-gradient(120deg, ${NAVY} 0%, #24398f 100%)` }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full opacity-25 blur-3xl"
            style={{ backgroundColor: primary }}
          />
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white opacity-10 blur-3xl" />
          <div className="relative">
            {title('text-3xl font-bold text-white md:text-4xl')}
            {body('mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-300')}
            {button(btnCls)}
          </div>
        </div>
      </section>
    );
  }

  if (s.type === 'testimonials') {
    const items = s.items ?? [];
    return (
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          {title('text-center text-3xl font-bold md:text-4xl')}
          {body('mx-auto mt-4 max-w-2xl text-center text-lg text-muted')}
          <div
            className={`mt-12 grid gap-6 ${
              items.length >= 3 ? 'md:grid-cols-3' : items.length === 2 ? 'md:grid-cols-2' : 'mx-auto max-w-2xl'
            }`}
          >
            {items.map((t, i) => (
              <figure key={i} className="group/card relative flex flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(i);
                  }}
                  className="absolute right-3 top-3 hidden text-muted hover:text-tier-low group-hover/card:block"
                  aria-label="Remove testimonial"
                >
                  <TrashIcon />
                </button>
                <Stars />
                <RichText
                  value={t.body}
                  onChange={(v) => patchItem(i, { body: v })}
                  className="mt-4 flex-1 text-base leading-relaxed text-ink"
                  placeholder="Quote"
                />
                <figcaption className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-5">
                  <span
                    className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-sm font-bold"
                    style={{ backgroundColor: `${primary}18`, color: primary }}
                  >
                    {initials(t.title)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <RichText value={t.title} onChange={(v) => patchItem(i, { title: v })} className="text-sm font-semibold" placeholder="Name" />
                    <RichText value={t.meta ?? ''} onChange={(v) => patchItem(i, { meta: v })} className="text-xs text-muted" placeholder="Role, company" />
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={() => addItem({ title: 'New customer', meta: 'Role, Company', body: 'What did they love about it?' })}
              className="rounded-lg border border-dashed border-gray-300 px-5 py-2 text-sm font-medium text-primary hover:border-primary"
            >
              + Add testimonial
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (s.type === 'categories2') {
    return (
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          {title('text-center text-3xl font-bold md:text-4xl')}
          {body('mx-auto mt-4 max-w-3xl text-center text-lg text-muted')}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {config.landing.categoryCards.map((c) => (
              <div key={c.key} className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${primary}12` }}>
                  <img src={c.image} alt="" className="h-9 w-9 object-contain" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{stripTags(c.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{stripTags(c.body)}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted">Cards mirror the Categories section — edit them there.</p>
        </div>
      </section>
    );
  }

  if (s.type === 'video') {
    const src = videoEmbedUrl(s.url ?? '');
    return (
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            {title('text-3xl font-bold leading-tight md:text-4xl')}
            {body('mt-5 text-lg leading-relaxed text-muted')}
            {button(btnCls)}
          </div>
          {src ? (
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-gray-900 text-white shadow-xl">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl">▶</span>
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-gray-900 px-6 text-center text-sm text-gray-300">
              Paste a YouTube or Vimeo link in the panel on the right
            </div>
          )}
        </div>
      </section>
    );
  }

  if (s.type === 'html') {
    return (
      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl" dangerouslySetInnerHTML={{ __html: s.html ?? '' }} />
        <p className="mt-2 text-center text-xs text-muted">Edit the HTML in the panel on the right.</p>
      </section>
    );
  }

  if (s.type === 'content') {
    return (
      <section className="px-6 py-20">
        <div className={`mx-auto grid max-w-6xl items-center gap-12 ${s.image ? 'md:grid-cols-2' : ''}`}>
          <div>
            <span className="block h-1 w-14 rounded-full" style={{ backgroundColor: primary }} aria-hidden />
            <div className="mt-5">{title('text-3xl font-bold leading-tight md:text-4xl')}</div>
            {body('mt-5 text-lg leading-relaxed text-muted')}
          </div>
          {s.image && (
            <div className="flex justify-center">
              <img src={s.image} alt="" className="w-full max-w-[460px] rounded-2xl object-cover shadow-card" />
            </div>
          )}
        </div>
      </section>
    );
  }

  // faq
  const items = s.items ?? [];
  return (
    <section className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-3xl">
        {title('text-center text-3xl font-bold md:text-4xl')}
        <div className="mt-10 space-y-3">
          {items.map((f, i) => (
            <div key={i} className="group/faq relative rounded-xl border border-gray-200 bg-white px-6 py-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(i);
                }}
                className="absolute right-4 top-4 hidden text-muted hover:text-tier-low group-hover/faq:block"
                aria-label="Remove question"
              >
                <TrashIcon />
              </button>
              <RichText value={f.title} onChange={(v) => patchItem(i, { title: v })} className="pr-8 text-lg font-medium" placeholder="Question" />
              <RichText
                value={f.body}
                onChange={(v) => patchItem(i, { body: v })}
                className="mt-3 text-base leading-relaxed text-muted"
                placeholder="Answer"
              />
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={() => addItem({ title: 'New question?', body: 'Write the answer here.' })}
            className="rounded-lg border border-dashed border-gray-300 px-5 py-2 text-sm font-medium text-primary hover:border-primary"
          >
            + Add question
          </button>
        </div>
      </div>
    </section>
  );
}
