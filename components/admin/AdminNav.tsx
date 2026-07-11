'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Outline icons, stroke = currentColor so they match the text colour.
const icons: Record<string, React.ReactNode> = {
  overview: (
    <path d="M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5" strokeLinecap="round" strokeLinejoin="round" />
  ),
  leads: (
    <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm-6 9c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14.7c1.8.7 3 2.1 3 4.3" strokeLinecap="round" strokeLinejoin="round" />
  ),
  landing: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M7 13h6M7 16.5h9" strokeLinecap="round" />
    </>
  ),
  questions: (
    <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" strokeLinecap="round" />
  ),
  results: (
    <>
      <path d="M12 12V3a9 9 0 1 1-9 9h9z" strokeLinejoin="round" />
      <path d="M15 3.5A9 9 0 0 1 20.5 9H15V3.5z" strokeLinejoin="round" />
    </>
  ),
  pdf: (
    <>
      <path d="M6 3h8l4 4v14H6z" strokeLinejoin="round" />
      <path d="M14 3v4h4M9 13h6M9 16.5h6" strokeLinecap="round" />
    </>
  ),
  branding: (
    <path d="M12 3c-4.97 0-9 3.8-9 8.5S7.03 20 12 20c.9 0 1.5-.6 1.5-1.4 0-.5-.2-.8-.5-1.1-.3-.3-.5-.7-.5-1.1 0-.8.7-1.4 1.5-1.4H16c2.76 0 5-2.2 5-5C21 6 17 3 12 3zM7.5 11.5h.01M10.5 7.5h.01M14.5 7.5h.01M17 11h.01" strokeLinecap="round" strokeLinejoin="round" />
  ),
  tiers: (
    <path d="M4 6h16M4 12h16M4 18h16M8 4v4M14 10v4M10 16v4" strokeLinecap="round" />
  ),
  leadform: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h4" strokeLinecap="round" />
    </>
  ),
};

function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[18px] w-[18px] flex-none">
      {icons[name]}
    </svg>
  );
}

const groups: { heading: string | null; items: { href: string; label: string; icon: string; exact?: boolean }[] }[] = [
  {
    heading: null,
    items: [
      { href: '/admin', label: 'Overview', icon: 'overview', exact: true },
      { href: '/admin/leads', label: 'Leads', icon: 'leads' },
    ],
  },
  {
    heading: 'Build',
    items: [
      { href: '/admin/editor/landing', label: 'Landing Page', icon: 'landing' },
      { href: '/admin/editor/questions', label: 'Questions', icon: 'questions' },
      { href: '/admin/build/results', label: 'Results Page', icon: 'results' },
      { href: '/admin/build/pdf', label: 'PDF Reports', icon: 'pdf' },
    ],
  },
  {
    heading: 'Settings',
    items: [
      { href: '/admin/settings/branding', label: 'Branding', icon: 'branding' },
      { href: '/admin/settings/score-tiers', label: 'Score Tiers', icon: 'tiers' },
      { href: '/admin/settings/lead-form', label: 'Lead Form', icon: 'leadform' },
    ],
  },
];

export default function AdminNav() {
  const pathname = usePathname();
  const isActive = (item: { href: string; exact?: boolean }) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <nav className="mt-6 space-y-6">
      {groups.map((g) => (
        <div key={g.heading ?? 'main'}>
          {g.heading && (
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted">
              {g.heading}
            </p>
          )}
          <div className="space-y-0.5">
            {g.items.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-[15px] ${
                  isActive(n) ? 'bg-gray-200/80 font-medium text-ink' : 'text-ink hover:bg-gray-100'
                }`}
              >
                <Icon name={n.icon} />
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function AdminNavMobile() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-4 whitespace-nowrap text-sm">
      {groups.flatMap((g) => g.items).map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className={pathname.startsWith(n.href) ? 'font-medium text-primary' : 'text-ink hover:text-primary'}
        >
          {n.label}
        </Link>
      ))}
    </nav>
  );
}
