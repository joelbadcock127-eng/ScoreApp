import { getConfig } from '@/lib/server/config';
import DistributionEditor from '@/components/admin/DistributionEditor';

export const dynamic = 'force-dynamic';

export default async function DistributionPage() {
  const config = await getConfig();
  return (
    <DistributionEditor
      leadFields={config.leadForm?.fields ?? []}
      initial={
        config.inviteEmail ?? {
          fromAddress: config.resultEmail?.fromAddress ?? '',
          fromName: config.resultEmail?.fromName ?? '',
          replyTo: config.resultEmail?.replyTo ?? '',
          subject: `You're invited: {scorecard_name}`,
          content:
            '<p>Hi {first_name},</p>' +
            '<p>We put together <b>{scorecard_name}</b> — a quick assessment that gives you a personalised score and practical next steps. It takes about 3 minutes.</p>' +
            '<p>{invite_button}</p>' +
            '<p>Your results and a downloadable report are generated just for you.</p>',
          headerImage: config.resultEmail?.headerImage,
          senderName: '',
          senderAddress: '',
        }
      }
    />
  );
}
