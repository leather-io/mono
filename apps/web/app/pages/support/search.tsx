import { data } from 'react-router';

import { cmsClient } from '~/constants/cms-client';

import type { Route } from './+types/search';

const DEPRECATION_POST_SLUGS = [
  'deprecation-of-ordinals-inscriptions-support-in-leather',
  'leather-stamps-src20-wallet',
  'leather-runes-wallet',
] as const;

const DEPRECATED_GUIDE_SLUGS = new Set([
  'send-ordinals',
  'receive-ordinals',
  'what-are-bitcoin-ordinals',
  'how-do-i-unprotect-bitcoin-utxo-s-with-inscriptions-so-it-becomes-available',
  'bitcoin-nfts',
  'send-brc-20-tokens',
  'receive-brc20',
  'what-are-brc20-tokens',
  'mint-brc20-magic-eden',
  'buy-brc20',
  'receive-stamps',
]);

const supportSearchQuery = `*[
  (_type == "helpCenterGuide" && [title, body] match $query + "*") ||
  (_type == "post" && slug.current in $deprecationPostSlugs && [title, body, summary] match $query + "*")
] | score(
  boost(title match $query + "*", 3)
) | order(_score desc)[0...10] {
  _id, _type, title, slug,
  "categories": *[_type == "helpCenterCategory" && ^._id in guides[]._ref]{ _id, name, slug }
}`;

interface SupportSearchDoc {
  _id: string;
  _type: 'helpCenterGuide' | 'post';
  title: string;
  slug: { _type?: 'slug'; current: string };
  categories: { _id: string; name: string; slug: { _type?: 'slug'; current: string } }[];
}

interface DeprecationSearchResult {
  kind: 'deprecation';
  _id: string;
  title: string;
  slug: { current: string };
  href: string;
  categories: [];
}

interface GuideSearchResult {
  kind: 'guide';
  _id: string;
  title: string;
  slug: { current: string };
  href: string;
  categories: { _id: string; name: string; slug: { current: string } }[];
}

export type SearchResultItem = DeprecationSearchResult | GuideSearchResult;

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  if (!query || query.length < 2) {
    return data({ results: [] as SearchResultItem[] });
  }

  const docs =
    (await cmsClient.fetch<SupportSearchDoc[]>(supportSearchQuery, {
      query,
      deprecationPostSlugs: [...DEPRECATION_POST_SLUGS],
    })) ?? [];

  const deprecations: DeprecationSearchResult[] = docs
    .filter(doc => doc._type === 'post')
    .map(doc => ({
      kind: 'deprecation',
      _id: doc._id,
      title: doc.title,
      slug: { current: doc.slug.current },
      href: `/posts/${doc.slug.current}`,
      categories: [],
    }));

  const guides: GuideSearchResult[] = docs
    .filter(doc => doc._type === 'helpCenterGuide' && !DEPRECATED_GUIDE_SLUGS.has(doc.slug.current))
    .map(doc => ({
      kind: 'guide',
      _id: doc._id,
      title: doc.title,
      slug: { current: doc.slug.current },
      href: `/support/${doc.slug.current}`,
      categories: doc.categories.map(c => ({
        _id: c._id,
        name: c.name,
        slug: { current: c.slug.current },
      })),
    }));

  return data({ results: [...deprecations, ...guides] satisfies SearchResultItem[] });
}
