import { getAccount } from '@/lib/server/config';
import { UsersEditor } from '@/components/account/AccountEditors';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  return <UsersEditor initial={await getAccount()} />;
}
