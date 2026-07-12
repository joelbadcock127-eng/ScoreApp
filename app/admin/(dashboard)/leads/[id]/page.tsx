import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/server/config';
import { supabaseAdmin } from '@/lib/server/supabase';
import { tierFor, questionMax } from '@/lib/scoring';
import { stripTags } from '@/lib/richtext';
import { CategoryScore, Lead } from '@/lib/types';
import Donut from '@/components/Donut';

export const dynamic = 'force-dynamic';

function fmtDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} : ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtDuration(s: number | null) {
  if (s == null) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  const { data: lead } = await supabaseAdmin()
    .from('leads')
    .select('*')
    .eq('id', params.id)
    .maybeSingle<Lead>();
  const config = await getConfig(lead?.scorecard_id);
  if (!lead) notFound();

  const tab = searchParams.tab === 'answers' ? 'answers' : 'overview';
  const overall = lead.overall_percent ?? 0;
  const tier = tierFor(overall, config.tiers);
  const categoryScores = (lead.category_scores ?? []) as CategoryScore[];
  const checkbox = config.leadForm.fields.find((f) => f.type === 'checkbox');

  return (
    <div>
      <Link href="/admin/leads" className="text-sm text-muted hover:text-primary">
        ← LEADS
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[300px,1fr]">
        {/* Left profile column */}
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-xl bg-navy px-6 pb-8 pt-14 text-center text-white">
            <div className="absolute -left-10 -top-10 h-28 w-28 rotate-45 bg-tier-medium" />
            <span className="absolute left-2 top-3 text-lg font-bold">{overall}%</span>
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-4xl text-gray-400">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-14 w-14">
                <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4 0-8 2-8 6v1h16v-1c0-4-4-6-8-6z" />
              </svg>
            </div>
            <p className="mt-4 text-2xl font-semibold">
              {lead.first_name} {lead.last_name}
            </p>
            <p className="mt-2 break-all text-sm text-gray-300">{lead.email}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {lead.status === 'completed' ? 'Completed' : 'Started'}
            </p>
            <p className="mt-1">😊 {fmtDuration(lead.duration_seconds)}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Date</p>
            <p className="mt-1">{fmtDate(lead.created_at)}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Business</p>
            <p className="mt-1">{lead.business || '—'}</p>
            {checkbox && (
              <>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                  {checkbox.label}
                </p>
                <p className="mt-1">{lead.contact_opt_in ? 'Yes' : 'No'}</p>
              </>
            )}
          </div>
        </div>

        {/* Right column */}
        <div>
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6">
            <nav className="flex gap-8 text-sm font-medium">
              {(['overview', 'answers'] as const).map((t) => (
                <Link
                  key={t}
                  href={`/admin/leads/${lead.id}?tab=${t}`}
                  className={`border-b-2 py-4 uppercase tracking-wide ${
                    tab === t ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  {t}
                </Link>
              ))}
            </nav>
            {lead.status === 'completed' && (
              <Link
                href={`/results/${lead.id}`}
                className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-blue-50"
              >
                View Result
              </Link>
            )}
          </div>

          {tab === 'overview' ? (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <div className="flex items-center gap-5 rounded-xl border border-orange-100 bg-orange-50/50 p-6">
                <Donut percent={overall} color={tier.color}>
                  <span className="text-xl font-bold">{overall}%</span>
                  <span className="text-xs text-muted">
                    {lead.score_total} / {lead.score_max}
                  </span>
                </Donut>
                <p className="text-lg font-medium">Overall Score</p>
              </div>
              {categoryScores.map((c) => {
                const t = tierFor(c.percent, config.tiers);
                return (
                  <div key={c.key} className="flex items-center gap-5 rounded-xl border border-gray-200 bg-white p-6">
                    <Donut percent={c.percent} color={t.color}>
                      <span className="text-xl font-bold">{c.percent}%</span>
                      <span className="text-xs text-muted">
                        {c.score} / {c.max}
                      </span>
                    </Donut>
                    <p className="text-lg font-medium">{c.label}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {config.questions.map((q, i) => {
                const v = lead.answers?.[q.id];
                const label =
                  v === q.min ? q.labels.left : v === q.max ? q.labels.right : v === Math.ceil((q.min + q.max) / 2) ? q.labels.center : '';
                return (
                  <div key={q.id} className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-muted">Question {i + 1}</p>
                    <p className="mt-1 font-medium">{stripTags(q.text)}</p>
                    <p className="mt-2 text-primary">
                      {v != null ? `${v} / ${questionMax(q) || q.max}` : 'Not answered'}
                      {label && <span className="ml-2 text-muted">— {label}</span>}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
