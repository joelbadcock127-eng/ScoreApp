import { redirect } from 'next/navigation';
import { getSessionAccount } from '@/lib/server/auth';
import { supabaseAdmin } from '@/lib/server/supabase';
import { listScorecards } from '@/lib/server/config';
import ManageAccounts, { AccountRow } from '@/components/account/ManageAccounts';

export const dynamic = 'force-dynamic';

export default async function ManageAccountsPage() {
  const account = await getSessionAccount();
  if (!account) redirect('/login');
  if (account.role !== 'owner') redirect('/account');

  const sb = supabaseAdmin();
  const [{ data: accounts }, scorecards] = await Promise.all([
    sb.from('accounts').select('id, name, email, role, created_at').order('created_at', { ascending: true }),
    listScorecards(),
  ]);
  const rows: AccountRow[] = (accounts ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    role: a.role,
    created_at: a.created_at,
    scorecards: scorecards.filter((s) => s.account_id === a.id).map((s) => ({ id: s.id, name: s.name })),
  }));
  return <ManageAccounts initial={rows} ownerId={account.id} />;
}
