import { getConfig } from '@/lib/server/config';
import ScoreTiersEditor from '@/components/admin/ScoreTiersEditor';

export const dynamic = 'force-dynamic';

export default async function ScoreTiersPage() {
  const config = await getConfig();
  return <ScoreTiersEditor initialTiers={config.tiers} initialMode={config.mode ?? 'scorecard'} />;
}
