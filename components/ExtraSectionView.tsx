/* eslint-disable @next/next/no-img-element */
import { ButtonAction, ExtraSection, ScorecardConfig } from '@/lib/types';
import { sanitizeRichText, stripTags } from '@/lib/richtext';
import InlineLeadForm from './InlineLeadForm';
import Reveal from './Reveal';

const NAVY = '#152042';

function rich(html: string) {
  return { dangerouslySetInnerHTML: { __html: sanitizeRichText(html) } };
}

function initials(name: string) {
  const words = stripTags(name).trim().split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase() || '★';
}

export function Stars() {
  return (
    <div className="flex gap-1 text-amber-400" aria-label="5 star rating">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5 h-[18px] w-[18px]">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5Z" />
        </svg>
      ))}
    </div>
  );
}

export function videoEmbedUrl(url: string): string | null {
  const yt = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/.exec(url);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = /vimeo\.com\/(\d+)/.exec(url);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

function Cta({
  label,
  action,
  primary,
  editable,
}: {
  label: string;
  action?: ButtonAction;
  primary: string;
  editable: boolean;
}) {
  const cls =
    'mt-8 inline-block rounded-lg px-10 py-3.5 text-lg font-medium text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110';
  const a = action ?? { type: 'lead-form' as const };
  if (editable) return <span className={cls} style={{ backgroundColor: primary }} {...rich(label)} />;
  if (a.type === 'url' && a.url) return <a href={a.url} className={cls} style={{ backgroundColor: primary }} {...rich(label)} />;
  if (a.type === 'page') {
    const href = a.page === 'quiz' ? '/quiz?preview=1' : a.page === 'results' ? '/results/preview' : '/';
    return <a href={href} className={cls} style={{ backgroundColor: primary }} {...rich(label)} />;
  }
  return <button data-start-scorecard className={cls} style={{ backgroundColor: primary }} {...rich(label)} />;
}

// Renders one gallery-added landing section on the public page. Each type has
// a single, carefully designed layout; sections fade up as they scroll into
// view (editable=true renders statically for previews and keeps buttons inert).
export default function ExtraSectionView({
  section: s,
  config,
  scorecardId,
  editable = false,
}: {
  section: ExtraSection;
  config: ScorecardConfig;
  scorecardId?: number;
  editable?: boolean;
}) {
  const primary = config.branding.primaryColor;

  let body: React.ReactNode = null;

  if (s.type === 'banner2') {
    body = (
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
            <h2 className="text-3xl font-bold leading-tight text-white md:text-5xl" {...rich(s.title ?? '')} />
            <p className="mt-6 text-lg leading-relaxed text-gray-300" {...rich(s.body ?? '')} />
            {s.button && <Cta label={s.button} action={s.action} primary={primary} editable={editable} />}
          </div>
          {s.image && (
            <div className="flex justify-center">
              <img
                src={s.image}
                alt=""
                className="w-full max-w-[460px] rounded-2xl shadow-2xl ring-1 ring-white/10"
              />
            </div>
          )}
        </div>
      </section>
    );
  } else if (s.type === 'form') {
    body = (
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold leading-tight md:text-4xl" {...rich(s.title ?? '')} />
            <p className="mt-5 text-lg leading-relaxed text-muted" {...rich(s.body ?? '')} />
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-xl">
            <InlineLeadForm leadForm={config.leadForm} scorecardId={scorecardId} disabled={editable} />
          </div>
        </div>
      </section>
    );
  } else if (s.type === 'cta2') {
    body = (
      <section className="px-6 py-16">
        <div
          className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl px-6 py-16 text-center"
          style={{ background: `linear-gradient(120deg, ${NAVY} 0%, #24398f 100%)` }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 -bottom-24 h-72 w-72 rounded-full opacity-25 blur-3xl"
            style={{ backgroundColor: primary }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white opacity-10 blur-3xl"
          />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white md:text-4xl" {...rich(s.title ?? '')} />
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-300" {...rich(s.body ?? '')} />
            {s.button && <Cta label={s.button} action={s.action} primary={primary} editable={editable} />}
          </div>
        </div>
      </section>
    );
  } else if (s.type === 'testimonials') {
    const items = s.items ?? [];
    body = (
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold md:text-4xl" {...rich(s.title ?? '')} />
          {s.body != null && s.body !== '' && (
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted" {...rich(s.body)} />
          )}
          <div
            className={`mt-12 grid gap-6 ${
              items.length >= 3 ? 'md:grid-cols-3' : items.length === 2 ? 'md:grid-cols-2' : 'mx-auto max-w-2xl'
            }`}
          >
            {items.map((t, i) => (
              <figure
                key={i}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-card"
              >
                <Stars />
                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-ink" {...rich(`“${t.body}”`)} />
                <figcaption className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-5">
                  <span
                    className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-sm font-bold"
                    style={{ backgroundColor: `${primary}18`, color: primary }}
                  >
                    {initials(t.title)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{stripTags(t.title)}</span>
                    {t.meta && <span className="block truncate text-xs text-muted">{stripTags(t.meta)}</span>}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    );
  } else if (s.type === 'categories2') {
    body = (
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold md:text-4xl" {...rich(s.title ?? '')} />
          <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-muted" {...rich(s.body ?? '')} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {config.landing.categoryCards.map((c) => (
              <div
                key={c.key}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-card"
              >
                <span
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${primary}12` }}
                >
                  <img src={c.image} alt="" className="h-9 w-9 object-contain" />
                </span>
                <h3 className="mt-4 text-lg font-semibold" {...rich(c.title)} />
                <p className="mt-2 text-sm leading-relaxed text-muted" {...rich(c.body)} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  } else if (s.type === 'video') {
    const src = videoEmbedUrl(s.url ?? '');
    const player = src ? (
      <div className="aspect-video w-full overflow-hidden rounded-2xl shadow-xl">
        {editable ? (
          <div className="flex h-full items-center justify-center bg-gray-900 text-white">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl">▶</span>
          </div>
        ) : (
          <iframe src={src} title="Video" allowFullScreen className="h-full w-full" />
        )}
      </div>
    ) : (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-gray-900 text-sm text-gray-300">
        {editable ? 'Paste a YouTube or Vimeo link in the panel on the right' : ''}
      </div>
    );
    body = (
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold leading-tight md:text-4xl" {...rich(s.title ?? '')} />
            <p className="mt-5 text-lg leading-relaxed text-muted" {...rich(s.body ?? '')} />
            {s.button && <Cta label={s.button} action={s.action} primary={primary} editable={editable} />}
          </div>
          {player}
        </div>
      </section>
    );
  } else if (s.type === 'html') {
    body = (
      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl" dangerouslySetInnerHTML={{ __html: s.html ?? '' }} />
      </section>
    );
  } else if (s.type === 'content') {
    body = (
      <section className="px-6 py-20">
        <div className={`mx-auto grid max-w-6xl items-center gap-12 ${s.image ? 'md:grid-cols-2' : ''}`}>
          <div>
            <span className="block h-1 w-14 rounded-full" style={{ backgroundColor: primary }} aria-hidden />
            <h2 className="mt-5 text-3xl font-bold leading-tight md:text-4xl" {...rich(s.title ?? '')} />
            <p className="mt-5 text-lg leading-relaxed text-muted" {...rich(s.body ?? '')} />
          </div>
          {s.image && (
            <div className="flex justify-center">
              <img src={s.image} alt="" className="w-full max-w-[460px] rounded-2xl object-cover shadow-card" />
            </div>
          )}
        </div>
      </section>
    );
  } else {
    // faq
    const items = s.items ?? [];
    body = (
      <section className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold md:text-4xl" {...rich(s.title ?? 'FAQs')} />
          <div className="mt-10 space-y-3">
            {items.map((f, i) => (
              <details
                key={i}
                className="group rounded-xl border border-gray-200 bg-white px-6 py-4 transition hover:border-gray-300"
                open={editable && i === 0}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
                  <span {...rich(f.title)} />
                  <span
                    aria-hidden
                    className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-lg transition-transform group-open:rotate-45"
                    style={{ backgroundColor: `${primary}12`, color: primary }}
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-base leading-relaxed text-muted" {...rich(f.body)} />
              </details>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return editable ? body : <Reveal>{body}</Reveal>;
}
