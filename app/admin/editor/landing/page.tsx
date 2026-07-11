import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/server/auth';
import { getConfig } from '@/lib/server/config';
import LandingEditor from '@/components/editor/LandingEditor';

export const dynamic = 'force-dynamic';

export default async function LandingEditorPage() {
  if (!isAdmin()) redirect('/admin/login');
  const config = await getConfig();
  return <LandingEditor initial={config} />;
}
