import type { ScorecardConfig } from './types';

// Favicon metadata for a scorecard: its Square icon (Theme → Brand images),
// falling back to the platform icon. Emitted with `sizes: 'any'` so browsers
// prefer it over a stale /favicon.ico.
export function faviconIcons(config?: Pick<ScorecardConfig, 'branding'> | null) {
  const url = config?.branding?.iconUrl?.trim() || '/images/icon.png';
  return { icon: [{ url, sizes: 'any' }], apple: [{ url }] };
}
