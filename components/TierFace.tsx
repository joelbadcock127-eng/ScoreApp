// Outline face matching the score tier: low = sad, middle tiers = flat, top = happy.
// Stroke-only (no fill) so it reads as an outline emoji in the tier colour.
export default function TierFace({
  kind,
  color,
  className = 'h-5 w-5',
}: {
  kind: 'sad' | 'flat' | 'happy';
  color: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r="0.6" fill={color} stroke="none" />
      <circle cx="15" cy="10" r="0.6" fill={color} stroke="none" />
      {kind === 'happy' && <path d="M8.5 14c.9 1.4 2.1 2.1 3.5 2.1s2.6-.7 3.5-2.1" strokeLinecap="round" />}
      {kind === 'flat' && <path d="M8.7 15h6.6" strokeLinecap="round" />}
      {kind === 'sad' && <path d="M8.5 16.2c.9-1.4 2.1-2.1 3.5-2.1s2.6.7 3.5 2.1" strokeLinecap="round" />}
    </svg>
  );
}

export function faceForTierIndex(index: number, count: number): 'sad' | 'flat' | 'happy' {
  if (index <= 0) return 'sad';
  if (index >= count - 1) return 'happy';
  return 'flat';
}
