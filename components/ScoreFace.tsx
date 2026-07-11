import { Tier } from '@/lib/types';
import { tierFor } from '@/lib/scoring';

// Outline-only emoji face coloured like the score's tier:
// lowest tier = sad, top tier = happy, anything between = flat smile.
export function faceKind(percent: number, tiers: Tier[]): 'sad' | 'flat' | 'happy' {
  const sorted = [...tiers].sort((a, b) => a.from - b.from);
  const tier = tierFor(percent, tiers);
  const idx = sorted.findIndex((t) => t.key === tier.key);
  if (idx <= 0) return 'sad';
  if (idx === sorted.length - 1) return 'happy';
  return 'flat';
}

export function FaceIcon({
  kind,
  color,
  className = 'h-5 w-5',
}: {
  kind: 'sad' | 'flat' | 'happy';
  color: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="8.7" cy="9.5" r="0.4" fill={color} />
      <circle cx="15.3" cy="9.5" r="0.4" fill={color} />
      {kind === 'sad' && <path d="M8.3 16.2c1-1.7 2.3-2.5 3.7-2.5s2.7.8 3.7 2.5" />}
      {kind === 'flat' && <path d="M8.5 15.3h7" />}
      {kind === 'happy' && <path d="M8.3 14c1 1.7 2.3 2.5 3.7 2.5s2.7-.8 3.7-2.5" />}
    </svg>
  );
}

// "78% 🙂" — percentage coloured like its tier with an outline face beside it.
export default function ScoreFace({
  percent,
  tiers,
  className = '',
}: {
  percent: number | null;
  tiers: Tier[];
  className?: string;
}) {
  if (percent == null) return <span className="text-muted">—</span>;
  const tier = tierFor(percent, tiers);
  const kind = faceKind(percent, tiers);
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium ${className}`} style={{ color: tier.color }}>
      {percent}%
      <FaceIcon kind={kind} color={tier.color} />
    </span>
  );
}
