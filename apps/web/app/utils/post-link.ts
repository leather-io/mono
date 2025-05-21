export function getPostHref(slug: string) {
  if (process.env.NODE_ENV === 'development') {
    return `https://prosperous-combination-099461.framer.app/posts/${slug}`;
  }
  return `https://leather.io/posts/${slug}`;
} 