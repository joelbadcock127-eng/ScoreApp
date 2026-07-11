'use client';

import { useMemo, useState } from 'react';

type Period = 'daily' | 'weekly' | 'monthly';

// Bars aggregated client-side from raw lead timestamps (last 365 days).
export default function LeadsChart({ createdDates }: { createdDates: string[] }) {
  const [period, setPeriod] = useState<Period>('daily');

  const bars = useMemo(() => {
    const now = new Date();
    const out: { label: string; count: number }[] = [];
    const pad = (n: number) => String(n).padStart(2, '0');
    if (period === 'daily') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400e3);
        const key = d.toISOString().slice(0, 10);
        out.push({
          label: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
          count: createdDates.filter((c) => c.slice(0, 10) === key).length,
        });
      }
    } else if (period === 'weekly') {
      for (let i = 11; i >= 0; i--) {
        const end = new Date(now.getTime() - i * 7 * 86400e3);
        const start = new Date(end.getTime() - 7 * 86400e3);
        out.push({
          label: `${pad(start.getDate())}/${pad(start.getMonth() + 1)}`,
          count: createdDates.filter((c) => {
            const t = new Date(c).getTime();
            return t > start.getTime() && t <= end.getTime();
          }).length,
        });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
        out.push({
          label: d.toLocaleDateString('en-AU', { month: 'short' }),
          count: createdDates.filter((c) => c.slice(0, 7) === key).length,
        });
      }
    }
    return out;
  }, [createdDates, period]);

  const maxCount = Math.max(2, ...bars.map((b) => b.count));

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly'} Leads
        </p>
        <div className="flex rounded-lg border border-gray-200 p-0.5 text-sm">
          {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1 capitalize ${
                period === p ? 'bg-gray-100 font-medium' : 'text-muted hover:bg-gray-50'
              }`}
            >
              {p}
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
        <span>{bars[0]?.label}</span>
        <span>{bars[Math.floor(bars.length / 2)]?.label}</span>
        <span>{bars[bars.length - 1]?.label}</span>
      </div>
    </div>
  );
}
