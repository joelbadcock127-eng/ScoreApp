// Minimal rich-text support for editor-authored copy: only bold, italic and
// underline (plus <br>) survive. Everything else is stripped, attributes
// included, so stored HTML stays safe to render with dangerouslySetInnerHTML.
const ALLOWED = new Set(['b', 'strong', 'i', 'em', 'u', 'br']);

export function sanitizeRichText(html: string): string {
  return String(html)
    .replace(/<\s*(\/?)\s*([a-zA-Z0-9]+)[^>]*>/g, (_m, slash: string, tag: string) => {
      const t = tag.toLowerCase();
      if (!ALLOWED.has(t)) return '';
      if (t === 'br') return '<br>';
      return `<${slash}${t}>`;
    })
    .replace(/&nbsp;/g, ' ');
}

export function stripTags(html: string): string {
  return String(html).replace(/<[^>]*>/g, '');
}
