import { getActiveOrDefaultId, listMyScorecards } from '@/lib/server/config';
import ScorecardsGrid from '@/components/admin/ScorecardsGrid';

export const dynamic = 'force-dynamic';

export default async function ScorecardsPage() {
  const [scorecards, activeId] = await Promise.all([listMyScorecards(), getActiveOrDefaultId()]);
  return <ScorecardsGrid scorecards={scorecards} activeId={activeId} />;
}
