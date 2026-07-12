export default function ReferralsPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold">Referrals</h1>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
            <rect x="3.5" y="8" width="17" height="4" rx="1" />
            <path d="M5.5 12v8h13v-8M12 8v12" />
            <path d="M12 8c-3.5 0-4.6-2-4-3.5C8.7 3 11 3.6 12 8ZM12 8c3.5 0 4.6-2 4-3.5C15.3 3 13 3.6 12 8Z" />
          </svg>
        </div>
        <p className="mt-4 text-lg font-semibold">Refer a business, share the upside</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          A referral programme is on the roadmap. For now, the best referral is sharing your scorecard — every
          completion puts your brand in front of a new lead.
        </p>
      </div>
    </div>
  );
}
