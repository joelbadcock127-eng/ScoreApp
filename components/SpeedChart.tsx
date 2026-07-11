import { Tier } from '@/lib/types';

// Semi-circular "speed chart" gauge: one coloured arc segment per score tier
// (segment size proportional to the tier's range) plus a needle at the score.
export default function SpeedChart({ percent, tiers }: { percent: number; tiers: Tier[] }) {
  const cx = 100;
  const cy = 95;
  const r = 70;
  const stroke = 26;
  const gapDeg = 4;

  function point(angleDeg: number, radius: number) {
    const rad = (Math.PI * (180 - angleDeg)) / 180; // 0% => left (180°), 100% => right (0°)
    return [cx + radius * Math.cos(rad), cy - radius * Math.sin(rad)];
  }

  function arc(fromPct: number, toPct: number, color: string, key: string) {
    const a1 = (fromPct / 100) * 180 + gapDeg / 2;
    const a2 = (toPct / 100) * 180 - gapDeg / 2;
    const [x1, y1] = point(a1, r);
    const [x2, y2] = point(a2, r);
    return (
      <path
        key={key}
        d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    );
  }

  // Needle
  const needleAngle = (Math.min(100, Math.max(0, percent)) / 100) * 180;
  const [nx, ny] = point(needleAngle, r - stroke / 2 - 8);

  return (
    <svg viewBox="0 0 200 110" className="w-full">
      {tiers.map((t, i) =>
        arc(t.from, i === tiers.length - 1 ? 100 : tiers[i + 1].from, t.color, t.key)
      )}
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke="#0c0d0d"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="7" fill="#0c0d0d" />
      <circle cx={cx} cy={cy} r="3" fill="#ffffff" />
    </svg>
  );
}
