import { type MetaDescriptor } from 'react-router';

import { SITE_ORIGIN } from '~/constants/constants';

export const defaultMarketingDescription =
  'Leather is an open-source, self-custodial wallet for Bitcoin and Stacks. Manage BTC, STX and supported tokens, connect to apps, and explore DeFi on mobile and in your browser.';

interface MarketingMetaOptions {
  title: string;
  path: `/${string}`;
  description?: string;
  image?: string;
}

export function marketingMeta({
  title,
  path,
  description = defaultMarketingDescription,
  image,
}: MarketingMetaOptions) {
  // Without an explicit image, root's default og:image (constants/meta-tags.ts) applies
  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    ...(image ? [{ property: 'og:image', content: image }] : []),
    { name: 'twitter:card', content: 'summary_large_image' },
    { tagName: 'link', rel: 'canonical', href: `${SITE_ORIGIN}${path}` },
  ] satisfies MetaDescriptor[];
}

// Marketing pages render the same HTML for every visitor, so browsers and the CDN can cache
// them briefly and serve a stale copy while revalidating (or while Sanity is down).
export function marketingHeaders() {
  return {
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
  };
}
