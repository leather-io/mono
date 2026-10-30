// /news lists the Sanity posts in the "News" category (the same 18 items the Framer page showed,
// minus the ones retired to a deprecation notice). Sanity's `images` field on these posts only
// carries file names, not uploaded assets, so the covers ship with the app, keyed by slug.

export interface NewsItem {
  slug: string;
  title: string;
  description: string | null;
}

interface NewsCover {
  /** 720px wide, used for list rows and as the hero fallback */
  src: string;
  /** 1280px wide, for the featured slot */
  largeSrc?: string;
}

export const newsListPageSize = 10;

export const newsPostsQuery = `*[
  _type == "post"
  && status == "published"
  && category == "News"
  && defined(slug.current)
] | order(publishedAt desc, title desc) {
  "slug": slug.current,
  title,
  "description": sentence
}`;

const newsCoverDir = '/marketing/news';

// Covers downloaded from the Framer CMS into public/marketing/news/<slug>.webp
const slugsWithCover = new Set([
  'grow-your-bitcoin-mobile-app',
  'grow-your-bitcoin-new-web-app',
  'partnerships-december-2024',
  'earn-rewards-sbtc',
  'partnerships-november-2024',
  'token-privacy-dapp-connections',
  'bitflow-integration',
  'a-faster-more-reliable-leather-with-mempool-space',
  'recapping-bitcoin-nashville-2024-why-bitcoin-wallets-need-better-ui-ux',
  'giving-users-the-best-bitcoin-wallet-balance-displays-usd-balances-in-leather',
  'gearing-up-for-2024-with-leather',
  'watch-your-recursive-inscriptions-come-to-life-in-leather',
  'stacks-multisig-support-is-live',
  'unpacking-leather-s-new-brand-identity',
  'introducing-leather-the-bitcoin-wallet-for-the-rest-of-us',
]);

// Also available as public/marketing/news/<slug>-large.webp for the featured slot
const slugsWithLargeCover = new Set(['grow-your-bitcoin-mobile-app']);

export function getNewsCover(slug: string): NewsCover | null {
  if (!slugsWithCover.has(slug)) return null;
  return {
    src: `${newsCoverDir}/${slug}.webp`,
    largeSrc: slugsWithLargeCover.has(slug) ? `${newsCoverDir}/${slug}-large.webp` : undefined,
  };
}
