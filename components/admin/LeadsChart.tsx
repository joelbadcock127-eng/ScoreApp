'use client';

import { useMemo, useState } from 'react';

type Granularity = 'daily' | 'weekly' | 'monthly';

const OPTIONS: { key: Granularity; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

// Buckets lead creation dates into daily (30 days), weekly (12 weeks) or monthly (12 months) bars.
export default function LeadsChart({ dates }: { dates: string[] }) {
  const [granularity, setGranularity] = useState<Granularity>('daily');

  const bars = useMemo(() => {
    const now = new Date();
    const out: { label: string; count: number }[] = [];
    if (granularity === 'daily') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
        const key = d.toISOString().slice(0, 10);
        out.push({
          label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
          count: dates.filter((c) => c.slice(0, 10) === key).length,
        });
      }
    } else if (granularity === 'weekly') {
      // 12 weeks, each starting Monday.
      const monday = new Date(now);
      monday.setHours(0, 0, 0, 0);
      monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
      for (let i = 11; i >= 0; i--) {
        const start = new Date(monday.getTime() - i * 7 * 24 * 3600 * 1000);
        const end = new Date(start.getTime() + 7 * 24 * 3600 * 1000);
        out.push({
          label: `${pad(start.getDate())}/${pad(start.getMonth() + 1)}`,
          count: dates.filter((c) => {
            const t = new Date(c).getTime();
            return t >= start.getTime() && t < end.getTime();
          }).length,
        });
      }
    } else {
      const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
        out.push({
          label: `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
          count: dates.filter((c) => c.slice(0, 7) === key).length,
        });
      }
    }
    return out;
  }, [granularity, dates]);

  const maxCount = Math.max(2, ...bars.map((b) => b.count));
  const heading =
    granularity === 'daily' ? 'Daily Leads' : granularity === 'weekly' ? 'Weekly Leads' : 'Monthly Leads';

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{heading}</p>
        <div className="flex rounded-lg border border-gray-200 p-0.5 text-sm">
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => setGranularity(o.key)}
              className={`rounded-md px-3 py-1 ${
                granularity === o.key ? 'bg-gray-100 font-medium text-ink' : 'text-muted hover:bg-gray-50'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 flex h-40 items-end gap-[3px]">
        {bars.map((b, i) => (
          <div key={i} className="group relative flex-1">
            <div
              className="w-full rounded-t bg-primary/80 transition group-hover:bg-primary"
              style={{ height: `${Math.max(3, (b.count / maxCount) * 150)}px`, opacity: b.count ? 1 : 0.15 }}
            />
            <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-navy px-2 py-0.5 text-xs text-white group-hover:block">
              {b.label}: {b.count}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span>{bars[0].label}</span>
        <span>{bars[Math.floor(bars.length / 2)].label}</span>
        <span>{bars[bars.length - 1].label}</span>
      </div>
    </div>
  );
}
