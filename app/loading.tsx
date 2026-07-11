import Spinner from '@/components/Spinner';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="text-sm text-muted">Loading…</p>
      </div>
    </div>
  );
}
