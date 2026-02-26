import { data } from 'react-router';

import { cmsClient } from '~/constants/cms-client';

import { helpCenterGuideSearchQuery } from '@leather.io/cms';

import type { Route } from './+types/search';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  if (!query || query.length < 2) {
    return data({ results: [] });
  }

  const results = await cmsClient.fetch(helpCenterGuideSearchQuery, { query });

  return data({ results: results ?? [] });
}
