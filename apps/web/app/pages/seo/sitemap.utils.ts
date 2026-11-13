import { SITE_ORIGIN } from '~/constants/constants';
import { type ContentFetchers, resolveContentSlug } from '~/pages/redirects/content-slug-resolver';

export const sitemapPagePaths = ['/', '/apps', '/news', '/explorer', '/posts', '/changelog'];

export const sitemapContentQuery = `{
  "postSlugs": *[
    _type == "post" && status == "published" && defined(slug.current)
  ] | order(publishedAt desc).slug.current,
  "guideSlugs": *[
    _type == "helpCenterGuide" && defined(slug.current)
  ] | order(title asc).slug.current
}`;

/** Result of sitemapContentQuery */
export interface SitemapCmsContent {
  postSlugs: string[];
  guideSlugs: string[];
}

interface SitemapContent extends SitemapCmsContent {
  /** From the repo content, see changelog.data.ts */
  changelogSlugs: string[];
}

/**
 * Every path the sitemap lists. Post slugs go through the same resolver as the /posts/:slug
 * route, and only slugs that serve content are listed, at their canonical URL. Help center
 * guides live on Leather Docs now, so deprecated slugs and posts that share a slug with a guide
 * (all 301 elsewhere) never make it in.
 */
export async function getSitemapPaths({ postSlugs, guideSlugs, changelogSlugs }: SitemapContent) {
  const posts = new Set(postSlugs);
  const guides = new Set(guideSlugs);
  const fetchers: ContentFetchers<string, string> = {
    fetchPost: slug => Promise.resolve(posts.has(slug) ? slug : null),
    fetchGuide: slug => Promise.resolve(guides.has(slug) ? slug : null),
  };

  const resolutions = await Promise.all(postSlugs.map(slug => resolveContentSlug(slug, fetchers)));
  const contentPaths = resolutions.flatMap(resolution =>
    resolution.kind === 'post' ? [resolution.canonicalPath] : []
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
  const urls = paths.map(path => `<url><loc>${escapeXml(`${SITE_ORIGIN}${path}`)}</loc></url>`);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}
