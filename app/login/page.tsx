import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/server/auth';
import AuthForm from '@/components/AuthForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Log in — Acceso AI Scorecards',
};

export default function LoginPage({ searchParams }: { searchParams?: { mode?: string } }) {
  if (isAdmin()) redirect('/account');
  const initialMode = searchParams?.mode === 'signup' ? 'signup' : 'login';
  return <AuthForm initialMode={initialMode} />;
}
