/* eslint-disable @next/next/no-img-element */
import Image from 'next/image';
import { getConfig } from '@/lib/server/config';
import StartScorecard from '@/components/StartScorecard';
import Footer from '@/components/Footer';
import VisitBeacon from '@/components/VisitBeacon';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const config = await getConfig();
  const { landing, leadForm } = config;

  return (
    <StartScorecard leadForm={leadForm}>
      <main>
        <VisitBeacon />
        {/* Header */}
        <header className="flex justify-center py-6">
          <img src={config.branding.logoUrl} alt="Logo" className="h-24 w-auto" />
        </header>

        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-8 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">{landing.heroTitle}</h1>
            <p className="mt-6 text-xl font-medium md:text-2xl">{landing.heroSubtitle}</p>
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
            <Image
              src="/images/hero-report.png"
              alt="Your AI Opportunity Report"
              width={520}
              height={694}
              priority
              className="w-full max-w-[520px] rounded-lg shadow-card"
            />
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-center text-lg">{landing.howItWorksLabel}</p>
          <h2 className="mt-4 text-center text-3xl font-bold md:text-5xl">{landing.howItWorksTitle}</h2>
          <p className="mx-auto mt-6 max-w-4xl text-center text-lg leading-relaxed text-muted">
            {landing.howItWorksBody}
          </p>
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {landing.categoryCards.map((card) => (
              <div key={card.key} className="border border-gray-200 bg-white px-8 py-14 text-center">
                <Image src={card.image} alt="" width={90} height={90} className="mx-auto h-[90px] w-[90px] object-contain" />
                <h3 className="mt-8 text-2xl font-semibold">{card.title}</h3>
                <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
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

        <Footer copyright={config.copyright} logoUrl={config.branding.logoUrl} />
      </main>
    </StartScorecard>
  );
}
