'use client';

import { useRouter } from 'next/navigation';
import { Lead, Tier } from '@/lib/types';
import { tierFor } from '@/lib/scoring';
import TierFace, { faceForTierIndex } from '@/components/TierFace';

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

// Entire row is clickable and drills into the lead, like the ScoreApp leads table.
export default function LeadRow({ lead, tiers }: { lead: Lead; tiers: Tier[] }) {
  const router = useRouter();
  const pct = lead.overall_percent ?? 0;
  const tier = tierFor(pct, tiers);
  const face = faceForTierIndex(tiers.findIndex((t) => t.key === tier.key), tiers.length);
  return (
    <tr
      onClick={() => router.push(`/admin/leads/${lead.id}`)}
      className="cursor-pointer border-t border-gray-100 transition hover:bg-gray-50"
    >
      <td className="px-6 py-4 font-medium">
        {lead.first_name} {lead.last_name}
      </td>
      <td className="px-6 py-4">{lead.email}</td>
      <td className="whitespace-nowrap px-6 py-4">
        {fmtDate(lead.created_at)}
        <span className="ml-3 text-muted">⏱ {fmtDuration(lead.duration_seconds)}</span>
      </td>
      <td className="px-6 py-4">
        <span className="flex items-center justify-end gap-2 font-semibold" style={{ color: tier.color }}>
          <TierFace kind={face} color={tier.color} />
          {pct}%
        </span>
      </td>
    </tr>
  );
}
