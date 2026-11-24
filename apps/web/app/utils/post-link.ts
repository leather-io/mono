// /posts/:slug 301s to wherever the post now lives
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
