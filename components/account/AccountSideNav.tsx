'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Sidebar for the account-level dashboard, mirroring ScoreApp's:
// Scorecards / Templates / AI Builder (New) / Account settings, then a HELP
// group and Referrals.
function Icon({ name }: { name: string }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'h-[18px] w-[18px]',
  };
  switch (name) {
    case 'scorecards':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 13h8M8 16.5h5" />
        </svg>
      );
    case 'templates':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" />
        </svg>
      );
    case 'ai':
      return (
        <svg {...common}>
          <path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3Z" />
          <path d="M18.5 14.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18" />
        </svg>
      );
    case 'help':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.2a2.6 2.6 0 0 1 5.1.6c0 1.7-2.6 2-2.6 3.5" />
          <circle cx="12" cy="17" r="0.4" fill="currentColor" />
        </svg>
      );
    case 'learning':
      return (
        <svg {...common}>
          <path d="m12 4 9.5 4.5L12 13 2.5 8.5 12 4Z" />
          <path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" />
        </svg>
      );
    case 'support':
      return (
        <svg {...common}>
          <path d="M4 6h16v11H9l-4 3.5V6Z" />
          <path d="M8.5 10.5h7M8.5 13h4.5" />
        </svg>
      );
    case 'referrals':
      return (
        <svg {...common}>
          <rect x="3.5" y="8" width="17" height="4" rx="1" />
          <path d="M5.5 12v8h13v-8M12 8v12" />
          <path d="M12 8c-3.5 0-4.6-2-4-3.5C8.7 3 11 3.6 12 8ZM12 8c3.5 0 4.6-2 4-3.5C15.3 3 13 3.6 12 8Z" />
        </svg>
      );
    default:
      return null;
  }
}

const MAIN = [
  { href: '/account/scorecards', label: 'Scorecards', icon: 'scorecards' },
  { href: '/account/templates', label: 'Templates', icon: 'templates' },
  { href: '/account/ai-builder', label: 'AI Builder', icon: 'ai', badge: 'New' },
  { href: '/account/settings', label: 'Account settings', icon: 'settings' },
];

const HELP = [
  { href: 'https://help.scoreapp.com', label: 'Help Center', icon: 'help', external: true },
  { href: 'https://www.scoreapp.com/learn', label: 'Learning Hub', icon: 'learning', external: true },
  { href: 'mailto:support@accesoai.com.au', label: 'Contact support', icon: 'support', external: true },
];

export default function AccountSideNav() {
  const pathname = usePathname();
  const linkClass = (active: boolean) =>
    `flex items-center gap-2.5 rounded-md px-3 py-2 text-[15px] ${
      active ? 'bg-gray-200/70 font-medium text-ink' : 'text-ink hover:bg-gray-100'
    }`;
  return (
    <nav className="mt-6 flex h-[calc(100%-1.5rem)] flex-col">
      <div className="space-y-0.5">
        {MAIN.map((n) => (
          <Link key={n.href} href={n.href} className={linkClass(pathname.startsWith(n.href))}>
            <Icon name={n.icon} />
            {n.label}
            {n.badge && (
              <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {n.badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted">Help</p>
        <div className="space-y-0.5">
          {HELP.map((n) => (
            <a key={n.href} href={n.href} target="_blank" rel="noopener noreferrer" className={linkClass(false)}>
              <Icon name={n.icon} />
              {n.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-auto border-t border-gray-200 pt-3">
        <Link href="/account/referrals" className={linkClass(pathname.startsWith('/account/referrals'))}>
          <Icon name="referrals" />
          Referrals
        </Link>
      </div>
    </nav>
  );
}
