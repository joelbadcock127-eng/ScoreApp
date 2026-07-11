import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/server/config';
import EmbedConfigurator, { EmbedType } from '@/components/admin/EmbedConfigurator';

export const dynamic = 'force-dynamic';

const TYPES = ['full', 'inline', 'popup', 'chat'] as const;

export default async function EmbedTypePage({ params }: { params: { type: string } }) {
  if (!TYPES.includes(params.type as (typeof TYPES)[number])) notFound();
  const config = await getConfig();
  return <EmbedConfigurator initialType={params.type as EmbedType} primaryColor={config.branding.primaryColor} />;
}
