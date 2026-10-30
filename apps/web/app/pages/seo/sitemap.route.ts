import { cmsClient, marketingCmsRequestOptions } from '~/constants/cms-client';

import {
  type SitemapContent,
  getSitemapPaths,
  renderSitemap,
  sitemapContentQuery,
} from './sitemap.utils';

export async function loader() {
  const content = await cmsClient.fetch<SitemapContent>(
    sitemapContentQuery,
    {},
    marketingCmsRequestOptions
  );
  const paths = await getSitemapPaths(content);

  return new Response(renderSitemap(paths), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
