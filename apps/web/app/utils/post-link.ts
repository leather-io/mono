export function getPostHref(slug: string) {
  // Check if the slug is already a full URL
  if (URL.canParse(slug)) {
    return slug; // Return the slug as-is if it's already a URL
  }

  // Otherwise, construct the URL based on environment
  if (process.env.NODE_ENV === 'development') {
    return `https://prosperous-combination-099461.framer.app/posts/${slug}`;
  }
  return `https://leather.io/posts/${slug}`;
}
