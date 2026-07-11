/* eslint-disable @next/next/no-img-element */
import { tierFor } from '@/lib/scoring';
import { CategoryScore, ScorecardConfig } from '@/lib/types';
import SpeedChart from '@/components/SpeedChart';
import Footer from '@/components/Footer';
import ChangeDetails from '@/components/ChangeDetails';
import ShareBar from '@/components/ShareBar';

export interface ResultsData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  business: string;
  contact_opt_in: boolean;
  overall_percent: number;
  category_scores: CategoryScore[];
}

export default function ResultsView({
  config,
  lead,
  reportHref,
}: {
  config: ScorecardConfig;
  lead: ResultsData;
  reportHref: string;
}) {
  const overall = lead.overall_percent;
  const tier = tierFor(overall, config.tiers);
  const intro = config.results.tierIntros[tier.key] ?? config.results.tierIntros.medium;
  const r = config.results;

  return (
    <ChangeDetails
      leadId={lead.id}
      leadForm={config.leadForm}
      changeDetails={r.changeDetails}
      defaults={{
        first_name: lead.first_name,
        last_name: lead.last_name,
        email: lead.email,
        business: lead.business,
        contact_opt_in: lead.contact_opt_in,
      }}
    >
      <main>
        {/* Global header */}
        <header className="flex justify-center border-b border-gray-100 py-6">
          <img src={config.branding.logoUrl} alt="Logo" className="h-24 w-auto" />
        </header>

        {/* Speed chart section */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-medium leading-snug md:text-4xl">
              {r.thanksPrefix}
              <br />
              <span className="font-bold">{config.title}</span>
            </h1>
            <p className="mt-8 text-lg leading-relaxed">{intro.headline}</p>
            {intro.body.map((p) => (
              <p key={p.slice(0, 24)} className="mt-6 text-lg leading-relaxed text-muted">
                {p}
              </p>
            ))}
            <p className="mt-6 text-lg leading-relaxed text-muted">
              {r.emailedNote} {lead.email} -{' '}
              <button data-change-details className="text-primary underline">
                {r.changeEmailLabel}
              </button>
            </p>
          </div>
          <div className="rounded-2xl bg-white p-8 shadow-card">
            <SpeedChart percent={overall} tiers={config.tiers} />
            <p className="mt-4 text-center text-2xl font-bold">{r.overallHeading}</p>
            <p className="text-center text-6xl font-bold" style={{ color: tier.color }}>
              {overall}%
            </p>
            <div className="mt-6 flex items-center justify-center gap-6">
              {config.tiers.map((t) => (
                <span key={t.key} className="flex items-center gap-2 text-base">
                  <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: t.color }} />
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Category scores */}
        <section className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-center text-3xl font-bold md:text-5xl">{r.categoryHeading}</h2>
          <p className="mx-auto mt-6 max-w-4xl text-center text-lg leading-relaxed text-muted">
            {r.categorySub.join(' ')}
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {lead.category_scores.map((c) => {
              const catTier = tierFor(c.percent, config.tiers);
              const text = r.categoryTexts[c.key]?.[catTier.key] ?? '';
              return (
                <div key={c.key} className="rounded-xl border border-gray-200 bg-white p-8">
                  <h3 className="text-2xl font-semibold">{c.label}</h3>
                  <p className="mt-4 text-base leading-relaxed text-muted">{text}</p>
                  <div className="mt-6 h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${c.percent}%`, backgroundColor: catTier.color }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xl font-semibold">
                    <span style={{ color: catTier.color }}>{c.percent}%</span>
                    <span style={{ color: catTier.color }}>{catTier.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Call to action */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-2xl font-medium">{r.cta.heading}</h2>
          <div className="mt-12 grid gap-12 md:grid-cols-2 md:divide-x md:divide-gray-300">
            <div className="text-center md:px-10">
              <h3 className="text-3xl font-medium md:text-4xl">{r.cta.leftTitle}</h3>
              <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted">{r.cta.leftBody}</p>
              <a
                href={reportHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block rounded-md bg-primary px-10 py-3.5 text-lg font-medium text-white transition hover:brightness-110"
              >
                {r.cta.leftButton}
              </a>
            </div>
            <div className="text-center md:px-10">
              <h3 className="text-3xl font-medium md:text-4xl">{r.cta.rightTitle}</h3>
              <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted">{r.cta.rightBody}</p>
              <button data-change-details className="mt-8 rounded-md bg-primary px-10 py-3.5 text-lg font-medium text-white transition hover:brightness-110">
                {r.cta.rightButton}
              </button>
            </div>
          </div>
        </section>

        <ShareBar text={r.share} />
        <Footer copyright={config.copyright} logoUrl={config.branding.logoUrl} />
      </main>
    </ChangeDetails>
  );
}
