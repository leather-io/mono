import { data } from 'react-router';

import { cmsClient } from '~/constants/cms-client';
import {
  deprecationPostSlugs,
  isDeprecatedContentSlug,
} from '~/pages/redirects/shared-redirect-logic';

import type { Route } from './+types/search';

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
    const results: SearchResultItem[] = [];
    return data({ results });
  }

  const docs =
    (await cmsClient.fetch<SupportSearchDoc[]>(supportSearchQuery, {
      query,
      deprecationPostSlugs,
    })) ?? [];

  const results: SearchResultItem[] = docs
    .filter(doc => doc._type === 'post' || !isDeprecatedContentSlug(doc.slug.current))
    .map(doc =>
      doc._type === 'post'
        ? {
            kind: 'deprecation',
            _id: doc._id,
            title: doc.title,
            slug: { current: doc.slug.current },
            href: `/posts/${doc.slug.current}`,
            categories: [],
          }
        : {
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
          }
    );

  return data({ results });
}
