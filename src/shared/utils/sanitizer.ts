import DOMPurify from 'dompurify';

/**
 * Strict configuration for DOMPurify to prevent XSS.
 * Only allows basic formatting tags and absolutely no scripts or event handlers.
 */
const strictConfig = {
  ALLOWED_TAGS: ['b', 'i', 'p', 'ul', 'li', 'br', 'strong', 'em'],
  ALLOWED_ATTR: [], // No attributes allowed at all (no style, no class, no src, no href)
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  FORBID_TAGS: ['script', 'iframe', 'style', 'object', 'embed', 'svg', 'math'],
  FORBID_ATTR: ['onerror', 'onload', 'onmouseover', 'style', 'src', 'href'],
  USE_PROFILES: { html: true },
};

/**
 * Sanitizes an HTML string using strict medical text policy.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, strictConfig) as string;
}
