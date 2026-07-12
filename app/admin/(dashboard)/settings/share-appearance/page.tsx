import { getConfig } from '@/lib/server/config';
import { ShareAppearanceEditor } from '@/components/admin/EmailSettingsEditors';

export const dynamic = 'force-dynamic';

export default async function ShareAppearancePage() {
  const config = await getConfig();
  return (
    <ShareAppearanceEditor
      initial={config.shareAppearance ?? { title: config.title, description: '', image: '' }}
    />
  );
}
