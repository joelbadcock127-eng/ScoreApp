import { NextResponse } from 'next/server';
import { getHostScorecardId } from '@/lib/server/config';

export const dynamic = 'force-dynamic';

// Public probe: which scorecard (if any) the current host resolves to. Used by
// the Domain settings screen to confirm a connected domain is live AND serving
// the right scorecard. Returns null on the platform host / unmapped subdomains.
export async function GET() {
  const scorecardId = await getHostScorecardId();
  return NextResponse.json({ scorecardId }, { headers: { 'Cache-Control': 'no-store' } });
}
