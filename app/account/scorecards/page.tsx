import { listScorecards, getActiveOrDefaultId } from '@/lib/server/config';
import { supabaseAdmin } from '@/lib/server/supabase';
import YourScorecards from '@/components/account/YourScorecards';

export const dynamic = 'force-dynamic';

export default async function AccountScorecardsPage() {
  const [scorecards, activeId] = await Promise.all([listScorecards(), getActiveOrDefaultId()]);
  const sb = supabaseAdmin();
  const visits = await Promise.all(
    scorecards.map((s) =>
      sb
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('scorecard_id', s.id)
        .then((r) => r.count ?? 0)
    )
  );
  const rows = scorecards.map((s, i) => ({
    id: s.id,
    name: s.name,
    is_default: s.is_default,
    created_at: s.created_at,
    visited: visits[i],
  }));
  return <YourScorecards rows={rows} activeId={activeId} />;
}
