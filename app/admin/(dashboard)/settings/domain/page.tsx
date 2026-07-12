import { BASE_DOMAIN, getActiveOrDefaultId, listMyScorecards } from '@/lib/server/config';
import { canUseCustomDomain, getSessionAccount } from '@/lib/server/auth';
import DomainEditor from '@/components/admin/DomainEditor';

export const dynamic = 'force-dynamic';

export default async function DomainPage() {
  const [scorecards, activeId, account] = await Promise.all([
    listMyScorecards(),
    getActiveOrDefaultId(),
    getSessionAccount(),
  ]);
  const active = scorecards.find((s) => s.id === activeId);
  return (
    <DomainEditor
      scorecardId={activeId}
      initialDomain={active?.domain ?? ''}
      initialCustomDomain={active?.custom_domain ?? ''}
      baseDomain={BASE_DOMAIN}
      allowCustomDomain={account ? canUseCustomDomain(account) : false}
    />
  );
}
