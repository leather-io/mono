/**
 * In-app URL for a legacy post slug. Posts are served by the app at /posts/:slug (the retired
 * Framer site's URLs), which resolves to the canonical post or help-center guide. Full URLs are
 * passed through unchanged.
 */
export function getPostHref(slug?: string) {
  if (slug === undefined || slug === null) {
    slug = 'undefined';
  }

  const trimmedSlug = slug.trim();

  if (URL.canParse(trimmedSlug)) {
    return trimmedSlug;
  }

  return `/posts/${trimmedSlug}`;
}
