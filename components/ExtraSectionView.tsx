/* eslint-disable @next/next/no-img-element */
import { ButtonAction, ExtraSection, ScorecardConfig } from '@/lib/types';
import { sanitizeRichText } from '@/lib/richtext';
import InlineLeadForm from './InlineLeadForm';

const NAVY = '#152042';

function rich(html: string) {
  return { dangerouslySetInnerHTML: { __html: sanitizeRichText(html) } };
}

function embedUrl(url: string): string | null {
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
  const cls = 'mt-8 inline-block rounded-md px-10 py-3.5 text-lg font-medium text-white transition hover:brightness-110';
  const a = action ?? { type: 'lead-form' as const };
  if (editable) return <span className={cls} style={{ backgroundColor: primary }} {...rich(label)} />;
  if (a.type === 'url' && a.url) return <a href={a.url} className={cls} style={{ backgroundColor: primary }} {...rich(label)} />;
  if (a.type === 'page') {
    const href = a.page === 'quiz' ? '/quiz?preview=1' : a.page === 'results' ? '/results/preview' : '/';
    return <a href={href} className={cls} style={{ backgroundColor: primary }} {...rich(label)} />;
  }
  return <button data-start-scorecard className={cls} style={{ backgroundColor: primary }} {...rich(label)} />;
}

// Renders one gallery-added landing section. Used by both the public landing
// page and the editor preview (editable=true keeps buttons/forms inert).
export default function ExtraSectionView({
  section: s,
  config,
  editable = false,
}: {
  section: ExtraSection;
  config: ScorecardConfig;
  editable?: boolean;
}) {
  const primary = config.branding.primaryColor;
  const dark = s.style?.includes('dark');
  const imageLeft = s.style === 'image-left';
  const bg = dark ? { backgroundColor: NAVY } : undefined;
  const textCls = dark ? 'text-white' : '';
  const mutedCls = dark ? 'text-gray-300' : 'text-muted';

  if (s.type === 'banner2') {
    return (
      <section className="px-6 py-16" style={bg}>
        <div className={`mx-auto grid max-w-6xl items-center gap-10 ${s.image ? 'md:grid-cols-2' : ''}`}>
          <div className={imageLeft ? 'md:order-2' : ''}>
            <h2 className={`text-3xl font-bold leading-tight md:text-5xl ${textCls}`} {...rich(s.title ?? '')} />
            <p className={`mt-6 text-lg leading-relaxed ${mutedCls}`} {...rich(s.body ?? '')} />
            {s.button && <Cta label={s.button} action={s.action} primary={primary} editable={editable} />}
          </div>
          {s.image && (
            <div className={`flex justify-center ${imageLeft ? 'md:order-1' : ''}`}>
              <img src={s.image} alt="" className="w-full max-w-[460px] rounded-lg shadow-card" />
            </div>
          )}
        </div>
      </section>
    );
  }

  if (s.type === 'form') {
    return (
      <section className="px-6 py-16" style={bg}>
        <div className={`mx-auto grid max-w-5xl items-center gap-10 ${s.image ? 'md:grid-cols-2' : ''}`}>
          <div>
            <h2 className={`text-3xl font-bold md:text-4xl ${textCls}`} {...rich(s.title ?? '')} />
            <p className={`mt-4 text-lg leading-relaxed ${mutedCls}`} {...rich(s.body ?? '')} />
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-card">
              <InlineLeadForm leadForm={config.leadForm} disabled={editable} />
            </div>
          </div>
          {s.image && (
            <div className="flex justify-center">
              <img src={s.image} alt="" className="w-full max-w-[420px] rounded-lg object-cover shadow-card" />
            </div>
          )}
        </div>
      </section>
    );
  }

  if (s.type === 'cta2') {
    const boxed = s.style === 'boxed';
    const inner = (
      <div className="mx-auto max-w-3xl px-6 py-14 text-center">
        <h2 className={`text-3xl font-bold md:text-4xl ${dark || boxed ? 'text-white' : ''}`} {...rich(s.title ?? '')} />
        <p className={`mx-auto mt-5 max-w-2xl text-lg leading-relaxed ${dark || boxed ? 'text-gray-300' : 'text-muted'}`} {...rich(s.body ?? '')} />
        {s.button && <Cta label={s.button} action={s.action} primary={primary} editable={editable} />}
      </div>
    );
    if (boxed) {
      return (
        <section className="px-6 py-14">
          <div className="mx-auto max-w-5xl rounded-2xl" style={{ backgroundColor: NAVY }}>
            {inner}
          </div>
        </section>
      );
    }
    return <section style={bg}>{inner}</section>;
  }

  if (s.type === 'testimonials') {
    const items = s.items ?? [];
    return (
      <section className="px-6 py-16" style={bg}>
        <div className="mx-auto max-w-6xl">
          <h2 className={`text-center text-3xl font-bold md:text-4xl ${textCls}`} {...rich(s.title ?? '')} />
          <div className={`mt-10 grid gap-6 ${items.length > 1 ? 'md:grid-cols-' + Math.min(3, items.length) : 'mx-auto max-w-2xl'}`}>
            {items.map((t, i) => (
              <figure key={i} className={`rounded-xl p-7 ${dark ? 'bg-white/10' : 'border border-gray-200 bg-white'}`}>
                <p className={`text-base leading-relaxed ${dark ? 'text-gray-100' : 'text-ink'}`} {...rich(`“${t.body}”`)} />
                <figcaption className="mt-5">
                  <span className={`block text-sm font-semibold ${textCls}`}>{t.title}</span>
                  {t.meta && <span className={`block text-xs ${mutedCls}`}>{t.meta}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (s.type === 'categories2') {
    return (
      <section className="px-6 py-16" style={bg}>
        <div className="mx-auto max-w-6xl">
          <h2 className={`text-center text-3xl font-bold md:text-4xl ${textCls}`} {...rich(s.title ?? '')} />
          <p className={`mx-auto mt-4 max-w-3xl text-center text-lg ${mutedCls}`} {...rich(s.body ?? '')} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {config.landing.categoryCards.map((c) => (
              <div key={c.key} className={`rounded-xl p-6 text-center ${dark ? 'bg-white/10' : 'border border-gray-200 bg-white'}`}>
                <img src={c.image} alt="" className="mx-auto h-14 w-14 object-contain" />
                <h3 className={`mt-4 text-lg font-semibold ${textCls}`} {...rich(c.title)} />
                <p className={`mt-2 text-sm leading-relaxed ${mutedCls}`} {...rich(c.body)} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (s.type === 'video') {
    const src = embedUrl(s.url ?? '');
    const player = src ? (
      <div className="aspect-video w-full overflow-hidden rounded-xl shadow-card">
        {editable ? (
          <div className="flex h-full items-center justify-center bg-gray-900 text-white">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl">▶</span>
          </div>
        ) : (
          <iframe src={src} title="Video" allowFullScreen className="h-full w-full" />
        )}
      </div>
    ) : (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-gray-900 text-sm text-gray-300">
        Paste a YouTube or Vimeo link in the panel on the right
      </div>
    );
    if (s.style === 'side') {
      return (
        <section className="px-6 py-16" style={bg}>
          <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className={`text-3xl font-bold md:text-4xl ${textCls}`} {...rich(s.title ?? '')} />
              <p className={`mt-4 text-lg leading-relaxed ${mutedCls}`} {...rich(s.body ?? '')} />
              {s.button && <Cta label={s.button} action={s.action} primary={primary} editable={editable} />}
            </div>
            {player}
          </div>
        </section>
      );
    }
    return (
      <section className="px-6 py-16" style={bg}>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className={`text-3xl font-bold md:text-4xl ${textCls}`} {...rich(s.title ?? '')} />
          <p className={`mx-auto mt-4 max-w-2xl text-lg ${mutedCls}`} {...rich(s.body ?? '')} />
          <div className="mt-8">{player}</div>
        </div>
      </section>
    );
  }

  if (s.type === 'html') {
    return (
      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl" dangerouslySetInnerHTML={{ __html: s.html ?? '' }} />
      </section>
    );
  }

  if (s.type === 'content') {
    if (s.style === 'centered') {
      return (
        <section className="px-6 py-16" style={bg}>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className={`text-3xl font-bold md:text-4xl ${textCls}`} {...rich(s.title ?? '')} />
            <p className={`mt-6 text-lg leading-relaxed ${mutedCls}`} {...rich(s.body ?? '')} />
          </div>
        </section>
      );
    }
    return (
      <section className="px-6 py-16" style={bg}>
        <div className={`mx-auto grid max-w-6xl items-center gap-10 ${s.image ? 'md:grid-cols-2' : ''}`}>
          <div className={imageLeft ? 'md:order-2' : ''}>
            <h2 className={`text-3xl font-bold md:text-4xl ${textCls}`} {...rich(s.title ?? '')} />
            <p className={`mt-5 text-lg leading-relaxed ${mutedCls}`} {...rich(s.body ?? '')} />
          </div>
          {s.image && (
            <div className={`flex justify-center ${imageLeft ? 'md:order-1' : ''}`}>
              <img src={s.image} alt="" className="w-full max-w-[460px] rounded-lg object-cover shadow-card" />
            </div>
          )}
        </div>
      </section>
    );
  }

  // faq
  const items = s.items ?? [];
  return (
    <section className="px-6 py-16" style={bg}>
      <div className="mx-auto max-w-4xl">
        <h2 className={`text-center text-3xl font-bold md:text-4xl ${textCls}`} {...rich(s.title ?? 'FAQs')} />
        <div className={`mt-8 ${s.style === 'two-col' ? 'grid gap-x-10 md:grid-cols-2' : ''}`}>
          {items.map((f, i) => (
            <details key={i} className="group border-b border-gray-200 py-4" open={editable && i === 0}>
              <summary className={`flex cursor-pointer list-none items-center justify-between text-lg font-medium ${textCls}`}>
                <span {...rich(f.title)} />
                <span aria-hidden className="text-muted transition-transform group-open:rotate-180">⌄</span>
              </summary>
              <p className={`mt-3 text-base leading-relaxed ${mutedCls}`} {...rich(f.body)} />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
