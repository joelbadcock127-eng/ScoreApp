import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/server/auth';
import { getAccount, getActiveOrDefaultId, getConfig, listScorecards } from '@/lib/server/config';
import AccountBar from '@/components/admin/AccountBar';
import AccountSideNav from '@/components/account/AccountSideNav';

// Account-level dashboard: same top bar as the scorecard admin, but its own
// sidebar (Scorecards / Templates / AI Builder / Account settings / Help).
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  if (!isAdmin()) redirect('/admin/login');
  const [config, scorecards, activeId, account] = await Promise.all([
    getConfig(),
    listScorecards(),
    getActiveOrDefaultId(),
    getAccount(),
  ]);
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <AccountBar
        accountName={account.name}
        scorecardTitle={config.title}
        iconUrl={config.branding.iconUrl}
        thumbUrl={config.shareAppearance?.image || config.landing.heroImage || config.branding.logoUrl}
        scorecards={scorecards}
        activeId={activeId}
      />
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 flex-none border-r border-gray-200 bg-white px-4 py-5 md:block">
          <AccountSideNav />
        </aside>
        <div className="min-w-0 flex-1">
          <div className="p-6 md:p-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
