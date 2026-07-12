'use client';

import { useEffect } from 'react';

// Records one landing-page visit per browser session for the admin Overview stats.
export default function VisitBeacon({ scorecardId }: { scorecardId?: number }) {
  useEffect(() => {
    const key = scorecardId != null ? `sc_visited_${scorecardId}` : 'sc_visited';
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: window.location.pathname, scorecard_id: scorecardId }),
      keepalive: true,
    }).catch(() => {});
  }, [scorecardId]);
  return null;
}
