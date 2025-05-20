import DOMPurify from 'dompurify';

/**
 * Universal sanitizer for dynamic HTML content.
 * Uses DOMPurify in the browser, and a safe fallback for SSR (returns plain text).
 */
export function sanitizeContent(dirty: string): string {
  if (typeof window !== 'undefined' && typeof DOMPurify !== 'undefined') {
    return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
  }
  // SSR fallback: escape HTML tags to prevent injection
  return String(dirty)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
