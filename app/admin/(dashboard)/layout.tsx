import Link from 'next/link';
import { redirect } from 'next/navigation';
import { canUseCustomDesign, getSessionAccount } from '@/lib/server/auth';
import { getActiveOrDefaultId, getConfig, listMyScorecards } from '@/lib/server/config';
import SideNav from '@/components/admin/SideNav';
import AccountBar from '@/components/admin/AccountBar';
import { NAV_GROUPS } from '@/components/admin/nav';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Everything in parallel — one database round-trip of latency, not four.
  const [account, scorecards, config, activeId] = await Promise.all([
    getSessionAccount(),
    listMyScorecards(),
    getConfig(),
    getActiveOrDefaultId(),
  ]);
  if (!account) redirect('/login');
  // Nothing to edit yet — go create a scorecard first.
  if (!scorecards.length) redirect('/account/scorecards');
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <AccountBar
        accountName={account.name}
        isOwner={account.role === 'owner'}
        scorecardTitle={config.title}
        iconUrl={config.branding.iconUrl}
        scorecards={scorecards}
        activeId={activeId}
      />
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 flex-none border-r border-gray-200 bg-white px-4 py-5 md:block">
          <SideNav scorecardId={activeId} showCustomDesign={canUseCustomDesign(account)} />
        </aside>
        <div className="min-w-0 flex-1">
          <div className="overflow-x-auto border-b border-gray-200 bg-white px-6 py-3 md:hidden">
            <nav className="flex gap-4 whitespace-nowrap text-sm">
              {NAV_GROUPS.flatMap((g) => g.items).map((n) => (
                <Link key={n.href} href={n.href} className="text-ink hover:text-primary">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-6 md:p-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
