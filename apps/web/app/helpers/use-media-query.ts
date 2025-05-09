import { useEffect, useState } from 'react';

import { BreakpointToken, token } from 'leather-styles/tokens';

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    function listener() {
      setMatches(media.matches);
    }
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);

  return matches;
}

export function useWindowMinWidth(width: number) {
  return useMediaQuery(`(min-width: ${width}px)`);
}

export function useViewportMinWidth(viewport: BreakpointToken) {
  return useMediaQuery(`(min-width: ${token(`breakpoints.${viewport}`)})`);
}
