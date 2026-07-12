import { getAccount } from '@/lib/server/config';
import { AccountSettingsEditor } from '@/components/account/AccountEditors';

export const dynamic = 'force-dynamic';

export default async function AccountSettingsPage() {
  return <AccountSettingsEditor initial={await getAccount()} />;
}
