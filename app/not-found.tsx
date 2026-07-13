import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Friendly 404. On an unmapped scorecard subdomain we link back to the
// platform host (not "/" on this same host, which would loop).
export default function NotFound() {
  const appHost = process.env.PUBLIC_APP_HOST;
  const home = appHost ? `https://${appHost}` : '/';
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold">This page isn’t set up</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        The scorecard you’re looking for doesn’t exist here, or this address hasn’t been connected to a scorecard yet.
      </p>
      <a
        href={home}
        className="mt-8 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white hover:brightness-110"
      >
        Go to Acceso AI
      </a>
      <Link href="/login" className="mt-4 text-sm text-muted hover:text-ink">
        Log in to your dashboard
      </Link>
    </main>
  );
}
