import { useRouteLoaderData } from 'react-router';

import { invariant } from '@epic-web/invariant';

/**
 * @returns the request info from the root loader
 */
export function useRequestInfo() {
  const data = useRouteLoaderData('root');
  invariant(data?.requestInfo, 'No requestInfo found in root loader');

  return data.requestInfo;
}
