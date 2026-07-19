// Minimal rich-text support for editor-authored copy: bold, italic, underline,
// paragraphs, line breaks and http(s) links survive. Everything else is
// stripped, attributes included, so stored HTML stays safe to render with
// dangerouslySetInnerHTML.
const ALLOWED = new Set(['b', 'strong', 'i', 'em', 'u', 'br', 'p', 'a']);

export function sanitizeRichText(html: string): string {
  return String(html)
    // contentEditable wraps each line in a <div> (an empty line is
    // <div><br></div>), so turn that structure into <br> before unknown tags
    // are stripped — otherwise pasted multi-line text loses its line breaks.
    .replace(/<div[^>]*>(?:\s|&nbsp;)*<br\s*\/?>(?:\s|&nbsp;)*<\/div>/gi, '<br>')
    .replace(/<div[^>]*>/gi, '<br>')
    .replace(/<\/div>/gi, '')
    .replace(/^\s*(?:<br\s*\/?>\s*)+/i, '')
    .replace(/<\s*(\/?)\s*([a-zA-Z0-9]+)([^>]*)>/g, (_m, slash: string, tag: string, attrs: string) => {
      const t = tag.toLowerCase();
      if (!ALLOWED.has(t)) return '';
      if (t === 'br') return '<br>';
      if (t === 'a' && !slash) {
        const href = /href\s*=\s*["']?(https?:\/\/[^"'\s>]+)/i.exec(attrs)?.[1];
        return href ? `<a href="${href}" target="_blank" rel="noopener noreferrer">` : '<a>';
      }
      return `<${slash}${t}>`;
    })
    .replace(/&nbsp;/g, ' ');
}

export function stripTags(html: string): string {
  return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
