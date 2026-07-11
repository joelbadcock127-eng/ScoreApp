import { getConfig } from '@/lib/server/config';
import BrandingEditor from '@/components/admin/BrandingEditor';

export const dynamic = 'force-dynamic';

export default async function BrandingPage() {
  const config = await getConfig();
  return <BrandingEditor initial={config.branding} />;
}
