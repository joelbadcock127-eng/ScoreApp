// Minimal rich-text sanitizer: keeps only b/strong/i/em/u/br tags, strips
// every attribute and all other tags. Used server-side before saving config.
export function sanitizeRichText(input: string, maxLength = 2000): string {
  const ALLOWED = ['b', 'strong', 'i', 'em', 'u', 'br'];
  let out = String(input).slice(0, maxLength * 4);
  // Remove disallowed tags entirely (keep their inner text).
  out = out.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (m, tag) => {
    const t = String(tag).toLowerCase();
    if (!ALLOWED.includes(t)) return '';
    const closing = m.startsWith('</');
    if (t === 'br') return '<br/>';
    return closing ? `</${t}>` : `<${t}>`;
  });
  // Neutralise stray angle brackets from partial tags.
  out = out.replace(/<(?!\/?(b|strong|i|em|u|br)\b)/gi, '&lt;');
  return out.slice(0, maxLength);
}

export function stripHtml(input: string): string {
  return String(input)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/\s+/g, ' ')
    .trim();
}
