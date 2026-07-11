/* eslint-disable @next/next/no-img-element */
import { getConfig } from '@/lib/server/config';
import { sanitizeRichText } from '@/lib/richtext';
import StartScorecard from '@/components/StartScorecard';
import Footer from '@/components/Footer';
import VisitBeacon from '@/components/VisitBeacon';

export const dynamic = 'force-dynamic';

function rich(html: string) {
  return { dangerouslySetInnerHTML: { __html: sanitizeRichText(html) } };
}

export default async function LandingPage() {
  const config = await getConfig();
  const { landing, leadForm } = config;
  const heroLeft = landing.imagePosition === 'left';
  const perRow = landing.categoriesPerRow === 1 ? 'md:grid-cols-1' : 'md:grid-cols-2';

  return (
    <StartScorecard leadForm={leadForm}>
      <main>
        <VisitBeacon />
        {/* Header */}
        {landing.showHeader !== false && (
          <header className="flex justify-center py-6">
            <img src={config.branding.logoUrl} alt="Logo" className="h-24 w-auto" />
          </header>
        )}

        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-8 md:grid-cols-2">
          <div className={heroLeft ? 'md:order-2' : ''}>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl" {...rich(landing.heroTitle)} />
            <p className="mt-6 text-xl font-medium md:text-2xl" {...rich(landing.heroSubtitle)} />
            <p className="mt-6 text-lg leading-relaxed text-muted" {...rich(landing.heroBody)} />
            <ul className="mt-8 space-y-3">
              {landing.heroBullets.map((b, i) => (
                <li key={i} className="flex items-center gap-3 text-lg">
                  <svg className="h-5 w-5 flex-none text-primary" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M3 11l4 4 10-11" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span {...rich(b)} />
                </li>
              ))}
            </ul>
            <button
              data-start-scorecard
              className="mt-10 w-full rounded-md bg-primary px-10 py-4 text-lg font-medium text-white transition hover:brightness-110 md:w-auto md:min-w-[340px]"
              {...rich(landing.heroCta)}
            />
          </div>
          <div className={`flex justify-center ${heroLeft ? 'md:order-1' : ''}`}>
            <img
              src={landing.heroImage || '/images/hero-report.png'}
              alt="Your AI Opportunity Report"
              width={520}
              height={694}
              className="w-full max-w-[520px] rounded-lg shadow-card"
            />
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-center text-lg" {...rich(landing.howItWorksLabel)} />
          <h2 className="mt-4 text-center text-3xl font-bold md:text-5xl" {...rich(landing.howItWorksTitle)} />
          <p className="mx-auto mt-6 max-w-4xl text-center text-lg leading-relaxed text-muted" {...rich(landing.howItWorksBody)} />
          <div className={`mt-14 grid gap-8 ${perRow}`}>
            {landing.categoryCards.map((card) => (
              <div key={card.key} className="border border-gray-200 bg-white px-8 py-14 text-center">
                <img src={card.image} alt="" width={90} height={90} className="mx-auto h-[90px] w-[90px] object-contain" />
                <h3 className="mt-8 text-2xl font-semibold" {...rich(card.title)} />
                <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted" {...rich(card.body)} />
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="text-3xl font-bold md:text-5xl" {...rich(landing.bottomTitle)} />
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-muted" {...rich(landing.bottomBody)} />
          <button
            data-start-scorecard
            className="mt-10 rounded-md bg-primary px-12 py-4 text-lg font-medium text-white transition hover:brightness-110"
            {...rich(landing.bottomCta)}
          />
          <p className="mt-10 text-lg text-muted" {...rich(landing.bottomNote)} />
        </section>

        {landing.showFooter !== false && (
          <Footer copyright={config.copyright} logoUrl={config.branding.logoUrl} />
        )}
      </main>
    </StartScorecard>
  );
}
