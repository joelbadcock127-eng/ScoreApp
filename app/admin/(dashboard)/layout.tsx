import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/server/auth';

const nav = [
  { href: '/admin', label: 'Leads' },
  { href: '/admin/settings/score-tiers', label: 'Score Tiers' },
  { href: '/admin/settings/lead-form', label: 'Lead Form' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAdmin()) redirect('/admin/login');
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-60 flex-none border-r border-gray-200 bg-white px-4 py-6 md:block">
        <p className="px-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Scorecard Setup
        </p>
        <nav className="mt-4 space-y-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block rounded-md px-3 py-2 text-[15px] text-ink hover:bg-gray-100"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t border-gray-200 pt-4">
          <Link href="/" className="block rounded-md px-3 py-2 text-[15px] text-muted hover:bg-gray-100">
            ← View Scorecard
          </Link>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="border-b border-gray-200 bg-white px-6 py-3 md:hidden">
          <nav className="flex gap-4 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="text-ink hover:text-primary">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-6 md:p-10">{children}</div>
      </div>
    </div>
  );
}
