import { cmsClient, marketingCmsRequestOptions } from '~/constants/cms-client';
import { getChangelogEntries } from '~/pages/changelog/changelog.data';

import {
  type SitemapCmsContent,
  getSitemapPaths,
  renderSitemap,
  sitemapContentQuery,
} from './sitemap.utils';

export async function loader() {
  const content = await cmsClient.fetch<SitemapCmsContent>(
    sitemapContentQuery,
    {},
    marketingCmsRequestOptions
  );
  const paths = await getSitemapPaths({
    ...content,
    changelogSlugs: getChangelogEntries().map(entry => entry.slug),
  });

  return new Response(renderSitemap(paths), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
