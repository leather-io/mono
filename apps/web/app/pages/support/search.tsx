import { data } from 'react-router';

import { cmsClient } from '~/constants/cms-client';

import type { Route } from './+types/search';

const supportSearchQuery = `*[
  _type == "helpCenterGuide" && [title, body] match $query + "*"
] | score(
  boost(title match $query + "*", 3)
) | order(_score desc)[0...10] {
  _id, _type, title, slug,
  "categories": *[_type == "helpCenterCategory" && ^._id in guides[]._ref]{ _id, name, slug }
}`;

interface SupportSearchDoc {
  _id: string;
  _type: 'helpCenterGuide';
  title: string;
  slug: { _type?: 'slug'; current: string };
  categories: { _id: string; name: string; slug: { _type?: 'slug'; current: string } }[];
}

interface GuideSearchResult {
  kind: 'guide';
  _id: string;
  title: string;
  slug: { current: string };
  href: string;
  categories: { _id: string; name: string; slug: { current: string } }[];
}

export type SearchResultItem = GuideSearchResult;

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  if (!query || query.length < 2) {
    return data({ results: [] as SearchResultItem[] });
  }

  const docs =
    (await cmsClient.fetch<SupportSearchDoc[]>(supportSearchQuery, {
      query,
    })) ?? [];

  const guides: GuideSearchResult[] = docs.map(doc => ({
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

  return data({ results: guides satisfies SearchResultItem[] });
}
