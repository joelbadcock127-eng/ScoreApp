/* eslint-disable @next/next/no-img-element */
import { tierFor } from '@/lib/scoring';
import { sanitizeRichText } from '@/lib/richtext';
import { CategoryScore, ResultsPageConfig, ResultsSectionKey, ScorecardConfig } from '@/lib/types';
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

const DEFAULT_PAGE: ResultsPageConfig = {
  order: ['speedChart', 'categoryScores', 'cta', 'share'],
  hidden: [],
  speedChart: { chartPosition: 'right', showOverall: true, scoreFormat: 'percent', showTiers: true },
  categories: { itemsPerRow: 2, showScores: true, showTier: true },
  share: { facebook: true, twitter: true, linkedin: true, background: '#152042', linksColor: '#ffffff' },
};

function rich(html: string) {
  return { dangerouslySetInnerHTML: { __html: sanitizeRichText(html) } };
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
  const page = config.resultsPage ?? DEFAULT_PAGE;
  const hidden = (k: string) => page.hidden.includes(k);
  const chartLeft = page.speedChart.chartPosition === 'left';
  const gridCols = page.categories.itemsPerRow === 1 ? '' : 'md:grid-cols-2';
  const sortedTiers = [...config.tiers].sort((a, b) => a.from - b.from);

  function renderSection(k: ResultsSectionKey) {
    if (hidden(k)) return null;
    if (k === 'speedChart') {
      return (
        <section key={k} className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2">
          <div className={chartLeft ? 'md:order-2' : ''}>
            <h1 className="text-3xl font-medium leading-snug md:text-4xl">
              <span {...rich(r.thanksPrefix)} />
              <br />
              <span className="font-bold">{config.title}</span>
            </h1>
            <p className="mt-8 text-lg leading-relaxed" {...rich(intro.headline)} />
            {intro.body.map((p) => (
              <p key={p.slice(0, 24)} className="mt-6 text-lg leading-relaxed text-muted" {...rich(p)} />
            ))}
            <p className="mt-6 text-lg leading-relaxed text-muted">
              <span {...rich(r.emailedNote)} /> {lead.email} -{' '}
              <button data-change-details className="text-primary underline">
                {r.changeEmailLabel}
              </button>
            </p>
          </div>
          <div className={`rounded-2xl bg-white p-8 shadow-card ${chartLeft ? 'md:order-1' : ''}`}>
            <SpeedChart percent={overall} tiers={config.tiers} />
            {page.speedChart.showOverall && (
              <>
                <p className="mt-4 text-center text-2xl font-bold" {...rich(r.overallHeading)} />
                <p className="text-center text-6xl font-bold" style={{ color: tier.color }}>
                  {page.speedChart.scoreFormat === 'percent' ? `${overall}%` : `${overall}/100`}
                </p>
              </>
            )}
            {page.speedChart.showTiers && (
              <div className="mt-6 flex items-center justify-center gap-6">
                {sortedTiers.map((t) => (
                  <span key={t.key} className="flex items-center gap-2 text-base">
                    <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }
    if (k === 'categoryScores') {
      return (
        <section key={k} className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-center text-3xl font-bold md:text-5xl" {...rich(r.categoryHeading)} />
          <div className="mx-auto mt-6 max-w-4xl text-center text-lg leading-relaxed text-muted">
            {r.categorySub.map((s, i) => (
              <p key={i} {...rich(s)} />
            ))}
          </div>
          <div className={`mt-12 grid gap-8 ${gridCols}`}>
            {lead.category_scores.map((c) => {
              const catTier = tierFor(c.percent, config.tiers);
              const text = r.categoryTexts[c.key]?.[catTier.key] ?? '';
              return (
                <div key={c.key} className="rounded-xl border border-gray-200 bg-white p-8">
                  <h3 className="text-2xl font-semibold">{c.label}</h3>
                  <p className="mt-4 text-base leading-relaxed text-muted" {...rich(text)} />
                  {page.categories.showScores && (
                    <>
                      <div className="mt-6 h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${c.percent}%`, backgroundColor: catTier.color }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xl font-semibold">
                        <span style={{ color: catTier.color }}>{c.percent}%</span>
                        {page.categories.showTier && <span style={{ color: catTier.color }}>{catTier.label}</span>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      );
    }
    if (k === 'cta') {
      return (
        <section key={k} className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-2xl font-medium" {...rich(r.cta.heading)} />
          <div className="mt-12 grid gap-12 md:grid-cols-2 md:divide-x md:divide-gray-300">
            <div className="text-center md:px-10">
              <h3 className="text-3xl font-medium md:text-4xl" {...rich(r.cta.leftTitle)} />
              <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted" {...rich(r.cta.leftBody)} />
              <a
                href={reportHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block rounded-md bg-primary px-10 py-3.5 text-lg font-medium text-white transition hover:brightness-110"
                {...rich(r.cta.leftButton)}
              />
            </div>
            <div className="text-center md:px-10">
              <h3 className="text-3xl font-medium md:text-4xl" {...rich(r.cta.rightTitle)} />
              <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted" {...rich(r.cta.rightBody)} />
              <button
                data-change-details
                className="mt-8 rounded-md bg-primary px-10 py-3.5 text-lg font-medium text-white transition hover:brightness-110"
                {...rich(r.cta.rightButton)}
              />
            </div>
          </div>
        </section>
      );
    }
    return (
      <ShareBar
        key={k}
        text={sanitizeRichText(r.share)}
        show={{ facebook: page.share.facebook, x: page.share.twitter, linkedin: page.share.linkedin }}
        background={page.share.background}
        linksColor={page.share.linksColor}
      />
    );
  }

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
        {!hidden('header') && (
          <header className="flex justify-center border-b border-gray-100 py-6">
            <img src={config.branding.logoUrl} alt="Logo" className="h-24 w-auto" />
          </header>
        )}
        {page.order.map((k) => renderSection(k))}
        {!hidden('footer') && <Footer copyright={config.copyright} logoUrl={config.branding.logoUrl} />}
      </main>
    </ChangeDetails>
  );
}
