import { createClient } from '@supabase/supabase-js';

// Server-only client using the service role key. Never import this from client components.
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }
  return createClient(url, key, {
    auth: { persistSession: false },
    global: {
      // supabase-js uses fetch, and Next.js caches fetch GETs in its Data
      // Cache by default — on Vercel that cache even persists across
      // deployments, so reads were served from a stale snapshot (new
      // scorecards invisible on the live site). Database reads must never
      // be cached.
      fetch: (input: RequestInfo | URL, init?: RequestInit) => fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}
