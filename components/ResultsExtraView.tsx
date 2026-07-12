import { ExtraSection, ScorecardConfig } from '@/lib/types';
import { sanitizeRichText } from '@/lib/richtext';
import { tierFor } from '@/lib/scoring';
import SpeedChart from '@/components/SpeedChart';
import Reveal from '@/components/Reveal';
import { DonutChart, RadarChart, formatScore, Thermometer, TierLegend, TrafficLight } from '@/components/results/ScoreCharts';

export interface ResultsChartData {
  overall: number;
  categories: { key: string; label: string; percent: number }[];
  email: string;
}

function rich(html: string) {
  return { dangerouslySetInnerHTML: { __html: sanitizeRichText(html) } };
}

export function isResultsChartType(type: string) {
  return ['overall-score', 'radar', 'thermometer', 'traffic-light', 'speed', 'donut'].includes(type);
}

// One gallery-added results chart section on the public results page. The
// editor has its own inline-editable twin (ResultsExtraEditable).
export default function ResultsExtraView({
  section: s,
  config,
  data,
  editable = false,
}: {
  section: ExtraSection;
  config: ScorecardConfig;
  data: ResultsChartData;
  editable?: boolean;
}) {
  const tier = tierFor(data.overall, config.tiers);
  const chartColor = s.color || config.branding.primaryColor;
  const chartLeft = s.chartPosition === 'left';
  const r = config.results;

  const heading = <h2 className="text-3xl font-medium leading-snug md:text-4xl" {...rich(s.title ?? '')} />;
  const bodyText = s.body ? <div className="mt-6 text-lg leading-relaxed text-muted" {...rich(s.body)} /> : null;
  const emailNote =
    s.showEmailNote !== false ? (
      <p className="mt-5 text-lg leading-relaxed text-muted">
        <span {...rich(r.emailedNote)} /> {data.email} —{' '}
        <button data-change-details className="text-primary underline" disabled={editable}>
          {r.changeEmailLabel}
        </button>
      </p>
    ) : null;

  let content: React.ReactNode = null;

  if (s.type === 'overall-score') {
    content = (
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2">
        <div className={chartLeft ? 'md:order-2' : ''}>
          {heading}
          {bodyText}
          {emailNote}
          {s.showTiers !== false && <TierLegend tiers={config.tiers} className="mt-8 !justify-start" />}
        </div>
        <div className={`rounded-xl bg-white p-10 text-center shadow-card ${chartLeft ? 'md:order-1' : ''}`}>
          <p className="text-sm font-bold uppercase tracking-widest">Your overall score</p>
          <p className="mt-2 text-7xl font-extrabold md:text-8xl" style={{ color: tier.color }}>
            {formatScore(data.overall, s.format)}
          </p>
          <div className="mx-auto mt-4 h-1.5 w-56 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full" style={{ width: `${data.overall}%`, backgroundColor: tier.color }} />
          </div>
          <p className="mt-4 text-3xl font-bold" style={{ color: tier.color }}>
            {tier.label}
          </p>
        </div>
      </section>
    );
  } else if (s.type === 'radar') {
    content = (
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        {heading}
        {emailNote && <div className="[&>p]:!mt-4">{emailNote}</div>}
        {bodyText}
        <div className="mt-8">
          <RadarChart values={data.categories} color={chartColor} />
        </div>
      </section>
    );
  } else if (s.type === 'thermometer') {
    content = (
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        {heading}
        <div className="mt-10">
          <Thermometer percent={data.overall} tiers={config.tiers} format={s.format} />
        </div>
        <p className="mt-4 text-xl font-semibold" style={{ color: tier.color }}>
          Your Overall Score
        </p>
        {s.showTiers !== false && <TierLegend tiers={config.tiers} className="mt-6" />}
        {emailNote}
        {bodyText}
      </section>
    );
  } else if (s.type === 'traffic-light') {
    content = (
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        {heading}
        <p className="mt-8 text-xl font-semibold" style={{ color: tier.color }}>
          Your Overall Score
        </p>
        <div className="relative mx-auto mt-4 flex max-w-xl items-center justify-center">
          <div className="absolute inset-0 mx-auto aspect-square max-h-full rounded-full bg-gray-100" aria-hidden />
          <div className="relative flex items-center gap-10 py-8">
            <TrafficLight percent={data.overall} tiers={config.tiers} format={s.format} />
            {s.showTiers !== false && (
              <div className="flex flex-col gap-4 text-left">
                {[...config.tiers]
                  .sort((a, b) => a.from - b.from)
                  .map((t) => (
                    <span key={t.key} className="flex items-center gap-2 text-base">
                      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.label}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>
        {emailNote}
        {bodyText}
      </section>
    );
  } else if (s.type === 'speed') {
    content = (
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2">
        <div className={chartLeft ? 'md:order-2' : ''}>
          {heading}
          {emailNote}
          {bodyText}
        </div>
        <div className={`rounded-xl bg-white p-8 text-center shadow-card ${chartLeft ? 'md:order-1' : ''}`}>
          <SpeedChart percent={data.overall} tiers={config.tiers} />
          <p className="mt-4 text-2xl font-bold">Your Overall Score</p>
          <p className="text-5xl font-extrabold" style={{ color: tier.color }}>
            {formatScore(data.overall, s.format)}
          </p>
          {s.showTiers !== false && <TierLegend tiers={config.tiers} className="mt-5" />}
        </div>
      </section>
    );
  } else {
    // donut
    content = (
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          {heading}
          {emailNote}
          {bodyText}
        </div>
        <div className="mt-12 grid items-center gap-12 md:grid-cols-2">
          <DonutChart
            segments={data.categories}
            color={chartColor}
            overall={data.overall}
            format={s.format}
            centerLabel="Your Overall Score"
          />
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            {data.categories.map((c, i) => {
              const ct = tierFor(c.percent, config.tiers);
              return (
                <div
                  key={c.key}
                  className={`flex items-center gap-4 px-4 py-4 ${i > 0 ? 'border-t border-gray-100' : ''}`}
                >
                  <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ backgroundColor: chartColor, opacity: [1, 0.75, 0.55, 0.38, 0.85][i % 5] }} />
                  <span className="min-w-0 flex-1 truncate text-lg">{c.label}</span>
                  <span className="text-lg font-semibold tabular-nums">{c.percent}%</span>
                  <span
                    className="w-20 flex-none rounded-md py-1.5 text-center text-sm font-semibold"
                    style={{ backgroundColor: `${ct.color}1c`, color: ct.color }}
                  >
                    {ct.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return editable ? content : <Reveal>{content}</Reveal>;
}
