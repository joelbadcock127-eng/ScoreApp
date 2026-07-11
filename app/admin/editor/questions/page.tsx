import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/server/auth';
import { getConfig } from '@/lib/server/config';
import QuestionsEditor from '@/components/editor/QuestionsEditor';

export const dynamic = 'force-dynamic';

export default async function QuestionsEditorPage() {
  if (!isAdmin()) redirect('/admin/login');
  const config = await getConfig();
  return <QuestionsEditor initial={config} />;
}
