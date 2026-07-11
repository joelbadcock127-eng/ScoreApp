import { getConfig } from '@/lib/server/config';
import LeadFormEditor from '@/components/admin/LeadFormEditor';

export const dynamic = 'force-dynamic';

export default async function LeadFormPage() {
  const config = await getConfig();
  return <LeadFormEditor initial={config.leadForm} />;
}
