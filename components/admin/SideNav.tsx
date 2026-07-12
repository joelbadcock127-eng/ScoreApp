'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_GROUPS } from './nav';
import AiSparkleIcon from '@/components/AiSparkleIcon';

// Small outline icons drawn with currentColor so they always match the label text colour.
function Icon({ name, className = 'h-[18px] w-[18px]' }: { name: string; className?: string }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  };
  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
        </svg>
      );
    case 'leads':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 20c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
          <path d="M15.5 5.6a3.2 3.2 0 0 1 0 4.8M17.8 15.4c1.5.8 2.4 2.3 2.7 4.6" />
        </svg>
      );
    case 'landing':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18" />
        </svg>
      );
    case 'questions':
      return (
        <svg {...common}>
          <path d="M9 6h12M9 12h12M9 18h12" />
          <path d="M3.5 5.2 4.6 4v4M3.5 11h2.2l-2.2 3h2.2" />
          <circle cx="4.5" cy="18" r="1.1" />
        </svg>
      );
    case 'results':
      return (
        <svg {...common}>
          <path d="M12 3a9 9 0 1 0 9 9h-9V3Z" />
          <path d="M15 3.5A9 9 0 0 1 20.5 9H15V3.5Z" />
        </svg>
      );
    case 'pdf':
      return (
        <svg {...common}>
          <path d="M6 3h8l4 4v14H6V3Z" />
          <path d="M14 3v4h4M9 12h6M9 16h6" />
        </svg>
      );
    case 'ai':
      return <AiSparkleIcon />;
    case 'branding':
      return (
        <svg {...common}>
          <path d="M12 21a9 9 0 1 1 9-9c0 2.5-1.5 3.5-3 3.5h-2a2.5 2.5 0 0 0-2 4c.4.6 0 1.5-2 1.5Z" />
          <circle cx="7.5" cy="11" r="0.6" fill="currentColor" />
          <circle cx="10.5" cy="7.5" r="0.6" fill="currentColor" />
          <circle cx="15" cy="7.5" r="0.6" fill="currentColor" />
        </svg>
      );
    case 'tiers':
      return (
        <svg {...common}>
          <path d="M4 6h10M4 12h16M4 18h7" />
          <circle cx="17" cy="6" r="2" />
          <circle cx="8" cy="18" r="2" />
        </svg>
      );
    case 'form':
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    case 'share':
      return (
        <svg {...common}>
          <circle cx="6" cy="12" r="2.6" />
          <circle cx="17.5" cy="5.5" r="2.6" />
          <circle cx="17.5" cy="18.5" r="2.6" />
          <path d="M8.3 10.8 15.2 6.8M8.3 13.2l6.9 4" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...common}>
          <path d="M6 9.5a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3.5 7 8.5 6 8.5-6" />
        </svg>
      );
    case 'globe':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
        </svg>
      );
    case 'embed':
      return (
        <svg {...common}>
          <path d="m9 8-4 4 4 4M15 8l4 4-4 4" />
          <path d="M13 5l-2 14" />
        </svg>
      );
    case 'external':
      return (
        <svg {...common}>
          <path d="M14 5h5v5" />
          <path d="M19 5 10.5 13.5" />
          <path d="M19 14v5H5V5h5" />
        </svg>
      );
    default:
      return null;
  }
}

function isActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(href + '/');
}

export default function SideNav({
  scorecardId,
  showCustomDesign = true,
}: {
  scorecardId?: number;
  showCustomDesign?: boolean;
}) {
  const pathname = usePathname();
  return (
    <>
      <nav className="mt-6 space-y-6">
        {NAV_GROUPS.map((g) => (
          <div key={g.heading ?? 'main'}>
            {g.heading && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted">
                {g.heading}
              </p>
            )}
            <div className="space-y-0.5">
              {g.items
                .filter((n) => showCustomDesign || n.href !== '/admin/build/custom')
                .map((n) => {
                const active = isActive(pathname, n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-[15px] ${
                      active ? 'bg-gray-200/70 font-medium text-ink' : 'text-ink hover:bg-gray-100'
                    }`}
                  >
                    <Icon name={n.icon} />
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-8 border-t border-gray-200 pt-4">
        <Link
          href={scorecardId != null ? `/s/${scorecardId}` : '/'}
          target="_blank"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[15px] text-muted hover:bg-gray-100"
        >
          <Icon name="external" />
          View Scorecard
        </Link>
      </div>
    </>
  );
}
