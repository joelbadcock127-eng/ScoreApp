import { getConfig } from '@/lib/server/config';
import { ResultEmailEditor } from '@/components/admin/EmailSettingsEditors';

export const dynamic = 'force-dynamic';

export default async function ResultEmailPage() {
  const config = await getConfig();
  return (
    <ResultEmailEditor
      initial={
        config.resultEmail ?? {
          enabled: true,
          fromAddress: '',
          fromName: '',
          replyTo: '',
          subject: '{scorecard_name} Report',
          content: '<p>Dear {first_name},</p>',
        }
      }
    />
  );
}
