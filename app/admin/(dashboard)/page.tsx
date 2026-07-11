import Link from 'next/link';
import { headers } from 'next/headers';
import { getConfig } from '@/lib/server/config';
import { supabaseAdmin } from '@/lib/server/supabase';
import { Lead } from '@/lib/types';
import Donut from '@/components/Donut';

export const dynamic = 'force-dynamic';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default async function OverviewPage() {
  const config = await getConfig();
  const sb = supabaseAdmin();
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();

  const [{ data: leads }, { count: visitCount }] = await Promise.all([
    sb
      .from('leads')
      .select('id, first_name, last_name, email, overall_percent, status, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .returns<Lead[]>(),
    sb.from('visits').select('*', { count: 'exact', head: true }).gte('created_at', since),
  ]);

  const all = leads ?? [];
  const started = all.length;
  const finished = all.filter((l) => l.status === 'completed').length;
  const visits = visitCount ?? 0;
  const conversion = visits > 0 ? Math.min(100, Math.round((finished / visits) * 100)) : 0;

  // Daily leads for the chart (last 30 days)
  const days: { label: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 3600 * 1000);
    const key = d.toISOString().slice(0, 10);
    days.push({
      label: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
      count: all.filter((l) => l.created_at.slice(0, 10) === key).length,
    });
  }
  const maxCount = Math.max(2, ...days.map((d) => d.count));

  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const url = `${proto}://${host}`;

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold">{greeting()}, Acceso AI</h1>

      {/* Scorecard card: preview thumbnail + live URL */}
      <div className="mt-6 flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center">
        <div className="relative h-32 w-48 flex-none overflow-hidden rounded-lg border border-gray-200 bg-white">
          <iframe
            src="/"
            title="Homepage preview"
            className="pointer-events-none absolute left-0 top-0 h-[768px] w-[1280px] origin-top-left"
            style={{ transform: 'scale(0.15)' }}
            tabIndex={-1}
          />
        </div>
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Live
          </span>
          <h2 className="mt-2 text-xl font-semibold">{config.title}</h2>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 break-all text-primary hover:underline"
          >
            {url} <span aria-hidden>↗</span>
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Overview</h2>
        <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-muted">
          Date: Last 30 Days
        </span>
      </div>
      <div className="mt-4 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Leads</p>
          <p className="mt-2 text-4xl font-bold">{finished}</p>
          <p className="mt-2 text-sm text-muted">
            Started {started} <span className="mx-1">→</span> Finished {finished}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Visits</p>
          <p className="mt-2 text-4xl font-bold">{visits}</p>
          <p className="mt-2 text-sm text-muted">Landing page views</p>
        </div>
        <div className="flex items-center gap-5 rounded-xl border border-gray-200 bg-white p-6">
          <Donut percent={conversion} color="#66bc46">
            <span className="text-xl font-bold">{conversion}%</span>
          </Donut>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Conversion</p>
            <p className="mt-1 text-sm text-muted">Visits → finished</p>
          </div>
        </div>
      </div>

      {/* Daily leads chart */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Daily Leads</p>
        </div>
        <div className="mt-4 flex h-40 items-end gap-[3px]">
          {days.map((d, i) => (
            <div key={i} className="group relative flex-1">
              <div
                className="w-full rounded-t bg-primary/80 transition group-hover:bg-primary"
                style={{ height: `${Math.max(3, (d.count / maxCount) * 150)}px`, opacity: d.count ? 1 : 0.15 }}
              />
              <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-navy px-2 py-0.5 text-xs text-white group-hover:block">
                {d.label}: {d.count}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted">
          <span>{days[0].label}</span>
          <span>{days[14].label}</span>
          <span>{days[29].label}</span>
        </div>
      </div>

      {/* Recent leads */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Recent Leads</p>
          <Link href="/admin/leads" className="text-sm font-medium text-primary hover:underline">
            View all Leads →
          </Link>
        </div>
        <div>
          {all.slice(0, 5).map((l) => (
            <Link
              key={l.id}
              href={`/admin/leads/${l.id}`}
              className="flex items-center justify-between border-t border-gray-100 px-6 py-3 hover:bg-gray-50"
            >
              <span className="font-medium">
                {l.first_name} {l.last_name}
              </span>
              <span className="text-sm text-muted">{l.email}</span>
              <span className="font-medium">{l.overall_percent != null ? `${l.overall_percent}%` : '—'}</span>
            </Link>
          ))}
          {all.length === 0 && <p className="border-t border-gray-100 px-6 py-6 text-muted">No leads yet.</p>}
        </div>
      </div>
    </div>
  );
}
