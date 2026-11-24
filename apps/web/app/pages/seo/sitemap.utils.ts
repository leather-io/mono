import { SITE_ORIGIN } from '~/constants/constants';

export const sitemapPagePaths = [
  '/',
  '/apps',
  '/explorer',
  '/sbtc',
  '/staking',
  '/changelog',
  '/privacy-policy',
  '/terms',
];

/** Every path the sitemap lists: the public pages and each changelog entry. */
export function getSitemapPaths(changelogSlugs: string[]) {
  return [
    ...sitemapPagePaths,
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
