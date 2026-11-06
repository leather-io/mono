export interface PostsIndexItem {
  slug: string;
  title: string;
  category: string | null;
}

export const postsIndexPageSize = 10;

// The Framer index (the retired "Notion Posts" collection) never listed app profiles, legal
// pages or token explainers; those live on /apps, in the footer and in the help center.
export const postsIndexExcludedCategories = ['Apps', 'Legal', 'Tokens'];

// Slugs that are also help center guides are skipped: their /posts URL 301s to /support/:slug.
export const postsIndexQuery = `*[
  _type == "post"
  && status == "published"
  && defined(slug.current)
  && !(category in $excludedCategories)
  && !(slug.current in *[_type == "helpCenterGuide"].slug.current)
] | order(publishedAt desc, title asc) {
  "slug": slug.current,
  title,
  category
}`;

/**
 * Drops posts whose slug no longer serves content (retired ordinals / runes / stamps posts
 * redirect to their deprecation notice), so every row lands on the post it names.
 */
export function selectListedPosts(
  posts: PostsIndexItem[],
  isRetiredSlug: (slug: string) => boolean
): PostsIndexItem[] {
  return posts.filter(post => post.title && !isRetiredSlug(post.slug));
}

export function normalizeSearchText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Case- and accent-insensitive match of every search word against title and category. */
export function filterPosts(posts: PostsIndexItem[], query: string): PostsIndexItem[] {
  const terms = normalizeSearchText(query).split(' ').filter(Boolean);
  if (terms.length === 0) return posts;

  return posts.filter(post => {
    const haystack = normalizeSearchText(`${post.title} ${post.category ?? ''}`);
    return terms.every(term => haystack.includes(term));
  });
}
