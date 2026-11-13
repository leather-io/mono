import { useMatches } from 'react-router';

/**
 * Optional `handle` a route module can export to tweak the root layout, e.g.
 * `export const handle = { chrome: 'none' } satisfies RouteHandle;`
 */
export interface RouteHandle {
  /** `none` renders the route without the nav sidebar, mobile menu button and footer. */
  chrome?: 'none';
}

function getChrome(handle: unknown) {
  if (typeof handle === 'object' && handle !== null && 'chrome' in handle) return handle.chrome;
  return undefined;
}

/** True when any matched route opts out of the app chrome (nav + footer). */
export function useHideChrome() {
  return useMatches().some(match => getChrome(match.handle) === 'none');
}
