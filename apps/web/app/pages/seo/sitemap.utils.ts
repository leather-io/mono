import { siteOrigin } from '~/pages/marketing/shared/marketing-meta';
import { type ContentFetchers, resolveContentSlug } from '~/pages/redirects/content-slug-resolver';

export const sitemapPagePaths = [
  '/',
  '/apps',
  '/developers',
  '/news',
  '/explorer',
  '/posts',
  '/support',
  '/changelog',
];

export const sitemapContentQuery = `{
  "postSlugs": *[
    _type == "post" && status == "published" && defined(slug.current)
  ] | order(publishedAt desc).slug.current,
  "guideSlugs": *[
    _type == "helpCenterGuide" && defined(slug.current)
  ] | order(title asc).slug.current,
  "changelogSlugs": *[
    _type == "changelog" && publishedAt <= now() && defined(slug.current)
  ] | order(publishedAt desc).slug.current
}`;

export interface SitemapContent {
  postSlugs: string[];
  guideSlugs: string[];
  changelogSlugs: string[];
}

/**
 * Every path the sitemap lists. Post and guide slugs go through the same resolver as the
 * /posts/:slug and /support/:slug routes, and only slugs that serve content are listed, at
 * their canonical URL. Deprecated slugs and posts that share a slug with a help center guide
 * (both 301 elsewhere) never make it in.
 */
export async function getSitemapPaths({ postSlugs, guideSlugs, changelogSlugs }: SitemapContent) {
  const posts = new Set(postSlugs);
  const guides = new Set(guideSlugs);
  const fetchers: ContentFetchers<string, string> = {
    fetchPost: slug => Promise.resolve(posts.has(slug) ? slug : null),
    fetchGuide: slug => Promise.resolve(guides.has(slug) ? slug : null),
  };

  const slugs = [...new Set([...guideSlugs, ...postSlugs])];
  const resolutions = await Promise.all(slugs.map(slug => resolveContentSlug(slug, fetchers)));
  const contentPaths = resolutions.flatMap(resolution =>
    resolution.kind === 'guide' || resolution.kind === 'post' ? [resolution.canonicalPath] : []
  );

  return [
    ...sitemapPagePaths,
    ...contentPaths,
    ...changelogSlugs.map(slug => `/changelog/${encodeURIComponent(slug)}`),
  ];
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function renderSitemap(paths: string[]) {
  const urls = paths.map(path => `<url><loc>${escapeXml(`${siteOrigin}${path}`)}</loc></url>`);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}
