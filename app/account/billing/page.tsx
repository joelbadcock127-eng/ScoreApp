export default function BillingPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold">Billing</h1>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink">Current plan</p>
            <p className="mt-1 text-2xl font-bold">Self-hosted</p>
            <p className="mt-1 text-sm text-muted">
              You run this app on your own hosting — unlimited scorecards, leads and users, no subscription.
            </p>
          </div>
          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">Active</span>
        </div>
        <div className="mt-6 grid gap-4 border-t border-gray-200 pt-5 text-sm sm:grid-cols-3">
          <div>
            <p className="font-semibold">Scorecards</p>
            <p className="text-muted">Unlimited</p>
          </div>
          <div>
            <p className="font-semibold">Leads</p>
            <p className="text-muted">Unlimited</p>
          </div>
          <div>
            <p className="font-semibold">Team members</p>
            <p className="text-muted">Unlimited</p>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm leading-relaxed text-ink">
        <p className="font-semibold">Running costs live elsewhere</p>
        <p className="mt-1">
          Hosting (e.g. Vercel), the Supabase database and your email provider (e.g. Resend) each bill separately —
          all have generous free tiers that cover a typical scorecard.
        </p>
      </div>
    </div>
  );
}
