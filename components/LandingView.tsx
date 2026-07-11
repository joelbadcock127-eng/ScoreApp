/* eslint-disable @next/next/no-img-element */
import { LandingConfig, Branding } from '@/lib/types';

export type LandingSectionKey = 'header' | 'leadform' | 'banner' | 'categories' | 'cta' | 'footer';

// Shared landing page renderer: used by the public page (server) and the
// landing editor (client, with section selection outlines).
export default function LandingView({
  landing,
  branding,
  copyright,
  selected,
  onSelect,
  selectedCard,
  onSelectCard,
}: {
  landing: LandingConfig;
  branding: Branding;
  copyright: string;
  selected?: LandingSectionKey | null;
  onSelect?: (s: LandingSectionKey) => void;
  selectedCard?: number | null;
  onSelectCard?: (i: number) => void;
}) {
  const editable = Boolean(onSelect);
  const wrap = (key: LandingSectionKey, node: React.ReactNode) =>
    editable ? (
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelect!(key);
        }}
        className={`relative cursor-pointer transition ${
          selected === key ? 'ring-2 ring-primary ring-offset-0' : 'hover:ring-2 hover:ring-blue-200'
        }`}
      >
        {selected === key && (
          <span className="absolute left-2 top-2 z-10 rounded bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            {key === 'cta' ? 'Call to Action' : key === 'leadform' ? 'Lead Form Popup' : key}
          </span>
        )}
        {node}
      </div>
    ) : (
      <>{node}</>
    );

  const alignClass =
    landing.header.alignment === 'left' ? 'justify-start pl-8' : landing.header.alignment === 'right' ? 'justify-end pr-8' : 'justify-center';

  const perRow = landing.categoriesPerRow;
  const gridCols = perRow === 1 ? 'md:grid-cols-1' : perRow === 4 ? 'md:grid-cols-4' : 'md:grid-cols-2';

  return (
    <main>
      {wrap(
        'header',
        <header className={`flex py-6 ${alignClass}`}>
          <img src={branding.logoUrl} alt="Logo" style={{ maxWidth: landing.header.logoMaxWidth }} className="h-24 w-auto" />
        </header>
      )}

      {wrap(
        'banner',
        <section
          className="px-6"
          style={{ backgroundColor: landing.bannerBackground === 'transparent' ? undefined : landing.bannerBackground }}
        >
          <div
            className={`mx-auto grid max-w-6xl items-center gap-12 pb-20 pt-8 md:grid-cols-2 ${
              landing.heroImagePosition === 'left' ? '[direction:rtl] [&>*]:[direction:ltr]' : ''
            }`}
          >
            <div>
              <h1
                className="text-4xl font-bold leading-tight md:text-6xl"
                dangerouslySetInnerHTML={{ __html: landing.heroTitle }}
              />
              <p
                className="mt-6 text-xl font-medium md:text-2xl"
                dangerouslySetInnerHTML={{ __html: landing.heroSubtitle }}
              />
              <p className="mt-6 text-lg leading-relaxed text-muted">{landing.heroBody}</p>
              <ul className="mt-8 space-y-3">
                {landing.heroBullets.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-lg">
                    <svg className="h-5 w-5 flex-none text-primary" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 11l4 4 10-11" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
              <button
                data-start-scorecard
                className="mt-10 w-full rounded-md bg-primary px-10 py-4 text-lg font-medium text-white transition hover:brightness-110 md:w-auto md:min-w-[340px]"
              >
                {landing.heroCta}
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={landing.heroImage}
                alt=""
                className="w-full max-w-[520px] rounded-lg shadow-card"
              />
            </div>
          </div>
        </section>
      )}

      {wrap(
        'categories',
        <section className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-center text-lg">{landing.howItWorksLabel}</p>
          <h2 className="mt-4 text-center text-3xl font-bold md:text-5xl">{landing.howItWorksTitle}</h2>
          <p className="mx-auto mt-6 max-w-4xl text-center text-lg leading-relaxed text-muted">
            {landing.howItWorksBody}
          </p>
          <div className={`mt-14 grid gap-8 ${gridCols}`}>
            {landing.categoryCards.map((card, i) => (
              <div
                key={card.key + i}
                onClick={(e) => {
                  if (onSelectCard) {
                    e.stopPropagation();
                    onSelect?.('categories');
                    onSelectCard(i);
                  }
                }}
                className={`border bg-white px-8 py-14 text-center ${
                  editable && selectedCard === i && selected === 'categories'
                    ? 'border-primary ring-1 ring-primary'
                    : 'border-gray-200'
                } ${editable ? 'cursor-pointer' : ''}`}
              >
                <img src={card.image} alt="" className="mx-auto h-[90px] w-[90px] object-contain" />
                <h3 className="mt-8 text-2xl font-semibold">{card.title}</h3>
                <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted">{card.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {wrap(
        'cta',
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="text-3xl font-bold md:text-5xl">{landing.bottomTitle}</h2>
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-muted">{landing.bottomBody}</p>
          <button
            data-start-scorecard
            className="mt-10 rounded-md bg-primary px-12 py-4 text-lg font-medium text-white transition hover:brightness-110"
          >
            {landing.bottomCta}
          </button>
          <p className="mt-10 text-lg text-muted">{landing.bottomNote}</p>
        </section>
      )}

      {landing.footer.show &&
        wrap(
          'footer',
          <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-12">
            <img src={branding.logoUrl} alt="Logo" className="h-20 w-auto" />
            <p className="text-lg text-muted">{copyright}</p>
          </footer>
        )}
    </main>
  );
}
