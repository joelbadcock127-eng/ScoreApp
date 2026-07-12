import { Tier } from '@/lib/types';
import { tierFor } from '@/lib/scoring';

// Pure-SVG score visuals shared by the public results page and the editor
// preview. No hooks, so they render on the server too.

export function TierLegend({ tiers, className = '' }: { tiers: Tier[]; className?: string }) {
  const sorted = [...tiers].sort((a, b) => a.from - b.from);
  return (
    <div className={`flex flex-wrap items-center justify-center gap-6 ${className}`}>
      {sorted.map((t) => (
        <span key={t.key} className="flex items-center gap-2 text-base">
          <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: t.color }} />
          {t.label}
        </span>
      ))}
    </div>
  );
}

export function formatScore(percent: number, format?: 'percent' | 'outof100') {
  return format === 'outof100' ? `${percent}/100` : `${percent}%`;
}

// ——— Radar / spider chart ————————————————————————————————————————————
export function RadarChart({
  values,
  color,
  levels = 5,
  size = 420,
}: {
  values: { label: string; percent: number }[];
  color: string;
  levels?: number;
  size?: number;
}) {
  const n = Math.max(3, values.length);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 64;
  const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const pt = (i: number, frac: number) => ({
    x: cx + r * frac * Math.cos(angle(i)),
    y: cy + r * frac * Math.sin(angle(i)),
  });
  const ring = (frac: number) =>
    Array.from({ length: n }, (_, i) => {
      const p = pt(i, frac);
      return `${p.x},${p.y}`;
    }).join(' ');
  const poly = values
    .map((v, i) => {
      const p = pt(i, Math.max(0, Math.min(100, v.percent)) / 100);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[460px]" role="img" aria-label="Category radar chart">
      {Array.from({ length: levels }, (_, l) => (
        <polygon key={l} points={ring((l + 1) / levels)} fill="none" stroke="#d7dae0" strokeWidth={1} />
      ))}
      {values.map((_, i) => {
        const p = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#d7dae0" strokeWidth={1} />;
      })}
      {/* Scale labels up the first axis */}
      {Array.from({ length: levels }, (_, l) => {
        const frac = (l + 1) / levels;
        return (
          <text key={l} x={cx - 8} y={cy - r * frac + 4} textAnchor="end" fontSize={11} fill="#8a8d93">
            {Math.round(frac * 100)}
          </text>
        );
      })}
      <polygon points={poly} fill={color} fillOpacity={0.35} stroke={color} strokeWidth={2} />
      {values.map((v, i) => {
        const p = pt(i, Math.max(0, Math.min(100, v.percent)) / 100);
        return <circle key={i} cx={p.x} cy={p.y} r={4} fill="#fff" stroke={color} strokeWidth={2} />;
      })}
      {values.map((v, i) => {
        const p = pt(i, 1.14);
        const anchor = Math.abs(Math.cos(angle(i))) < 0.3 ? 'middle' : Math.cos(angle(i)) > 0 ? 'start' : 'end';
        const words = v.label.split(' ');
        const lines = words.length > 2 ? [words.slice(0, 2).join(' '), words.slice(2).join(' ')] : [v.label];
        return (
          <text key={i} x={p.x} y={p.y} textAnchor={anchor} fontSize={14} fill="#0c0d0d">
            {lines.map((ln, j) => (
              <tspan key={j} x={p.x} dy={j === 0 ? 0 : 16}>
                {ln}
              </tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}

// ——— Thermometer ————————————————————————————————————————————————————
export function Thermometer({
  percent,
  tiers,
  format,
  outerColor = '#505070',
}: {
  percent: number;
  tiers: Tier[];
  format?: 'percent' | 'outof100';
  outerColor?: string;
}) {
  const tier = tierFor(percent, tiers);
  // Tube from y=30 (100%) to y=210 (0%); bulb centred at (70, 265) r=48.
  const fillTop = 210 - (Math.max(0, Math.min(100, percent)) / 100) * 180;
  return (
    <svg viewBox="0 0 220 330" className="mx-auto h-[330px] w-auto" role="img" aria-label="Thermometer score chart">
      {/* Scale ticks */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={130} y={44 + i * 38} width={i % 2 === 0 ? 34 : 26} height={11} rx={5.5} fill={44 + i * 38 > fillTop ? tier.color : '#e4e6ea'} />
      ))}
      {/* Outer body */}
      <path
        d="M70 18 a26 26 0 0 1 26 26 v170 a48 48 0 1 1 -52 0 v-170 a26 26 0 0 1 26 -26 Z"
        fill="#fff"
        stroke={outerColor}
        strokeWidth={12}
        strokeLinejoin="round"
      />
      {/* Mercury column */}
      <rect x={58} y={fillTop} width={24} height={Math.max(0, 262 - fillTop)} rx={10} fill={tier.color} />
      {/* Bulb */}
      <circle cx={70} cy={265} r={40} fill={tier.color} />
      <text x={70} y={272} textAnchor="middle" fontSize={22} fontWeight={700} fill="#fff">
        {formatScore(percent, format)}
      </text>
    </svg>
  );
}

// ——— Traffic light ———————————————————————————————————————————————————
export function TrafficLight({
  percent,
  tiers,
  format,
}: {
  percent: number;
  tiers: Tier[];
  format?: 'percent' | 'outof100';
}) {
  const sorted = [...tiers].sort((a, b) => b.from - a.from); // top lamp = low tier? screenshot: red top, green bottom
  const byPosition = [...tiers].sort((a, b) => a.from - b.from); // low → high
  const lamps = [byPosition[0], byPosition[1] ?? byPosition[0], byPosition[2] ?? byPosition[byPosition.length - 1]];
  const active = tierFor(percent, tiers);
  void sorted;
  return (
    <svg viewBox="0 0 260 420" className="mx-auto h-[380px] w-auto" role="img" aria-label="Traffic light score chart">
      {/* Housing with side tabs */}
      {[70, 195, 320].map((y) => (
        <path key={y} d={`M60 ${y - 28} L18 ${y} L60 ${y + 28} Z`} fill="#28325d" />
      ))}
      {[70, 195, 320].map((y) => (
        <path key={y} d={`M200 ${y - 28} L242 ${y} L200 ${y + 28} Z`} fill="#28325d" />
      ))}
      <rect x={55} y={10} width={150} height={400} rx={24} fill="#28325d" />
      {lamps.map((t, i) => {
        const y = 70 + i * 125;
        const isActive = t.key === active.key;
        return (
          <g key={t.key}>
            <circle cx={130} cy={y} r={48} fill={t.color} opacity={isActive ? 1 : 0.32} />
            {isActive && (
              <text x={130} y={y + 8} textAnchor="middle" fontSize={26} fontWeight={700} fill="#fff">
                {formatScore(percent, format)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ——— Donut (categories as proportional segments) ————————————————————
export function DonutChart({
  segments,
  color,
  overall,
  format,
  centerLabel,
  thickness = 0.4,
  size = 380,
}: {
  segments: { label: string; percent: number }[];
  color: string;
  overall: number;
  format?: 'percent' | 'outof100';
  centerLabel: string;
  thickness?: number;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 10;
  const rInner = rOuter * (1 - Math.max(0.15, Math.min(0.7, thickness)));
  const total = segments.reduce((s, x) => s + Math.max(1, x.percent), 0) || 1;
  const gap = 0.012; // radians of spacing between segments
  let a = -Math.PI / 2;

  function arcPath(a0: number, a1: number) {
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = (r: number, ang: number) => `${cx + r * Math.cos(ang)},${cy + r * Math.sin(ang)}`;
    return [
      `M ${p(rOuter, a0)}`,
      `A ${rOuter} ${rOuter} 0 ${large} 1 ${p(rOuter, a1)}`,
      `L ${p(rInner, a1)}`,
      `A ${rInner} ${rInner} 0 ${large} 0 ${p(rInner, a0)}`,
      'Z',
    ].join(' ');
  }

  const shades = [1, 0.75, 0.55, 0.38, 0.85, 0.65, 0.45];
  const arcs = segments.map((s, i) => {
    const span = (Math.max(1, s.percent) / total) * Math.PI * 2 - gap;
    const a0 = a + gap / 2;
    const a1 = a0 + span;
    a = a1 + gap / 2;
    const mid = (a0 + a1) / 2;
    const rMid = (rOuter + rInner) / 2;
    return {
      d: arcPath(a0, a1),
      opacity: shades[i % shades.length],
      label: `${s.percent}%`,
      lx: cx + rMid * Math.cos(mid),
      ly: cy + rMid * Math.sin(mid),
      wide: span > 0.35,
    };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[400px]" role="img" aria-label="Donut score chart">
      {arcs.map((s, i) => (
        <path key={i} d={s.d} fill={color} opacity={s.opacity} />
      ))}
      {arcs.map(
        (s, i) =>
          s.wide && (
            <text key={i} x={s.lx} y={s.ly + 4} textAnchor="middle" fontSize={13} fontWeight={600} fill="#fff">
              {s.label}
            </text>
          )
      )}
      <text x={cx} y={cy - 10} textAnchor="middle" fontSize={17} fill="#0c0d0d">
        {centerLabel}
      </text>
      <text x={cx} y={cy + 36} textAnchor="middle" fontSize={42} fontWeight={800} fill={color}>
        {formatScore(overall, format)}
      </text>
    </svg>
  );
}
