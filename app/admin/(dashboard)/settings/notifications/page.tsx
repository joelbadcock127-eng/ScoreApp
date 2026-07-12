import { getConfig } from '@/lib/server/config';
import { NotificationsEditor } from '@/components/admin/EmailSettingsEditors';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const config = await getConfig();
  return (
    <NotificationsEditor
      initial={
        config.notifications ?? {
          enabled: true,
          recipients: '',
          subject: '{first_name} {last_name} started the {scorecard_name}',
          content: '<p><b>Congratulations!</b></p><p>You just got a new lead.</p>',
        }
      }
    />
  );
}
