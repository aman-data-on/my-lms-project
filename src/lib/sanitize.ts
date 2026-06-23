import DOMPurify from 'dompurify';

/**
 * Sanitizes an HTML string before it is injected into the DOM via
 * dangerouslySetInnerHTML. All HTML rendered from database content or
 * user-controlled input must pass through this function.
 *
 * Strips: <script>, event handlers (onclick, onerror, …), javascript: hrefs,
 * data: URIs in src/href, and any other XSS vectors DOMPurify recognises.
 * Safe structural tags (h1–h6, p, ul, ol, li, table, strong, em, …) are kept.
 */
export function safeHtml(dirty: string | null | undefined): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
  });
}
