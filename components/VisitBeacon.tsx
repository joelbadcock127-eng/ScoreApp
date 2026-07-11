'use client';

import { useEffect } from 'react';

// Records one landing-page visit per browser session for the admin Overview stats.
export default function VisitBeacon() {
  useEffect(() => {
    if (sessionStorage.getItem('sc_visited')) return;
    sessionStorage.setItem('sc_visited', '1');
    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: window.location.pathname }),
      keepalive: true,
    }).catch(() => {});
  }, []);
  return null;
}
