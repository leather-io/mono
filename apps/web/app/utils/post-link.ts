export function getPostHref(slug: string) {
  const trimmedSlug = slug.trim();

  if (URL.canParse(trimmedSlug)) {
    return trimmedSlug;
  }

  if (import.meta.env.DEV) {
    return `https://prosperous-combination-099461.framer.app/posts/${trimmedSlug}`;
  }

  return `https://leather.io/posts/${trimmedSlug}`;
}
