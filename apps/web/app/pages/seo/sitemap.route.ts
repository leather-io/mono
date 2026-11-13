import { getChangelogEntries } from '~/pages/changelog/changelog.data';

import { getSitemapPaths, renderSitemap } from './sitemap.utils';

export function loader() {
  const paths = getSitemapPaths(getChangelogEntries().map(entry => entry.slug));

  return new Response(renderSitemap(paths), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
