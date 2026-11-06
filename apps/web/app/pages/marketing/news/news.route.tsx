import { cmsClient, marketingCmsRequestOptions } from '~/constants/cms-client';
import { marketingHeaders, marketingMeta } from '~/pages/marketing/shared/marketing-meta';
import { MarketingPage } from '~/pages/marketing/shared/marketing-page';
import { isDeprecatedContentSlug } from '~/pages/redirects/shared-redirect-logic';

import { type Route } from './+types/news.route';
import { NewsPage } from './news-page';
import { type NewsItem, newsPostsQuery } from './news.data';

export const headers = marketingHeaders;

export function meta() {
  return marketingMeta({ title: 'News – Leather', path: '/news' });
}

export async function loader() {
  try {
    const items =
      (await cmsClient.fetch<NewsItem[]>(newsPostsQuery, {}, marketingCmsRequestOptions)) ?? [];
    // Retired runes / ordinals announcements now redirect to their deprecation notice; skip them
    // rather than list a headline that lands somewhere else.
    return { items: items.filter(item => item.title && !isDeprecatedContentSlug(item.slug)) };
  } catch (error) {
    // A Sanity outage renders an empty list rather than a 500
    // eslint-disable-next-line no-console
    console.error('Failed to load news', error);
    return { items: [] };
  }
}

export default function NewsRoute({ loaderData }: Route.ComponentProps) {
  return (
    <MarketingPage title="News" showBack>
      <NewsPage items={loaderData.items} />
    </MarketingPage>
  );
}
