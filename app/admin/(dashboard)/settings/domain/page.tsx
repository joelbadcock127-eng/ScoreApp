import { BASE_DOMAIN, getActiveOrDefaultId, listScorecards } from '@/lib/server/config';
import DomainEditor from '@/components/admin/DomainEditor';

export const dynamic = 'force-dynamic';

export default async function DomainPage() {
  const [scorecards, activeId] = await Promise.all([listScorecards(), getActiveOrDefaultId()]);
  const active = scorecards.find((s) => s.id === activeId);
  return (
    <DomainEditor
      scorecardId={activeId}
      initialDomain={active?.domain ?? ''}
      initialCustomDomain={active?.custom_domain ?? ''}
      baseDomain={BASE_DOMAIN}
    />
  );
}
