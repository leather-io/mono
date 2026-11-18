import { useMatches } from 'react-router';

export interface RouteHandle {
  /** `none` renders the route without the nav sidebar, mobile menu button and footer. */
  chrome?: 'none';
}

function getChrome(handle: unknown) {
  if (typeof handle === 'object' && handle !== null && 'chrome' in handle) return handle.chrome;
  return undefined;
}

export function useHideChrome() {
  return useMatches().some(match => getChrome(match.handle) === 'none');
}
