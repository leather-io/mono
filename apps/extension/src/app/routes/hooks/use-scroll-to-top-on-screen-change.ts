import { useLayoutEffect, useRef } from 'react';
import { NavigationType, useMatches, useNavigationType } from 'react-router';

export function isSameScreen(previousRouteIds: string[], nextRouteIds: string[]) {
  const previousLeafId = previousRouteIds.at(-1);
  const nextLeafId = nextRouteIds.at(-1);
  if (!previousLeafId || !nextLeafId) return true;
  return nextRouteIds.includes(previousLeafId) || previousRouteIds.includes(nextLeafId);
}

export function useScrollToTopOnScreenChange() {
  const matches = useMatches();
  const navigationType = useNavigationType();
  const previousRouteIds = useRef<string[]>([]);

  useLayoutEffect(() => {
    const routeIds = matches.map(match => match.id);
    const previous = previousRouteIds.current;
    previousRouteIds.current = routeIds;

    if (navigationType === NavigationType.Pop) return;
    if (isSameScreen(previous, routeIds)) return;
    window.scrollTo(0, 0);
  }, [matches, navigationType]);
}
