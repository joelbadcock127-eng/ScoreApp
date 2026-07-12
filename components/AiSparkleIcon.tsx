// The AI mark: a sparkle filled with a slowly-shifting rainbow gradient and a
// twinkling companion star. Used wherever a feature is AI-powered. Animations
// live in globals.css (.ai-sparkle-*).
export default function AiSparkleIcon({ className = 'h-[18px] w-[18px]' }: { className?: string }) {
  const id = 'aiRainbow';
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`ai-sparkle ${className}`} aria-hidden>
      <defs>
        <linearGradient id={id} x1="3" y1="21" x2="21" y2="3" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed">
            <animate
              attributeName="stop-color"
              values="#7c3aed;#2563eb;#06b6d4;#10b981;#f59e0b;#ec4899;#7c3aed"
              dur="6s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#ec4899">
            <animate
              attributeName="stop-color"
              values="#ec4899;#7c3aed;#2563eb;#06b6d4;#10b981;#f59e0b;#ec4899"
              dur="6s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
      </defs>
      <path
        className="ai-sparkle-main"
        d="M12 2.6l2 5.4 5.4 2-5.4 2-2 5.4-2-5.4-5.4-2 5.4-2 2-5.4Z"
        fill={`url(#${id})`}
      />
      <path
        className="ai-sparkle-star"
        d="M18.7 14.6l.85 2.05 2.05.85-2.05.85-.85 2.05-.85-2.05-2.05-.85 2.05-.85.85-2.05Z"
        fill={`url(#${id})`}
      />
    </svg>
  );
}
