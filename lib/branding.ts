import { Branding } from './types';

// Href for wrapping public-page logos; bare domains get https:// prepended.
export function logoLink(branding: Pick<Branding, 'logoLinkUrl'>): string | undefined {
  const raw = branding.logoLinkUrl?.trim();
  if (!raw) return undefined;
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}
