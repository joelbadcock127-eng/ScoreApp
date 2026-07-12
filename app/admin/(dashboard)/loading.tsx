import Spinner from '@/components/Spinner';

// Keeps the dashboard chrome visible while a page loads.
export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="h-8 w-8 text-primary" />
    </div>
  );
}
