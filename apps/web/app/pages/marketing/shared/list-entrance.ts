import { type CSSProperties, useEffect, useState } from 'react';

import { css } from 'leather-styles/css';

// Fade-up for the rows of the /news and /posts lists on first render, like the Framer site's
// list appear effect. Pure CSS (runs before hydration, ends fully visible, so no-JS and SSR are
// unaffected). Reduced motion: no animation.
export const listRowEntranceStyles = css({
  _motionSafe: { animation: 'marketingRiseIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' },
});

export const listFeatureEntranceStyles = css({
  _motionSafe: { animation: 'marketingAppear 0.6s cubic-bezier(0.25, 1, 0.5, 1) 0.1s both' },
});

const rowBaseDelay = 0.1;
const rowStagger = 0.03;
// Rows past this index start together, so a long list doesn't trickle in
const maxStaggeredRows = 8;
// Longest delay + duration, rounded up
const entranceWindowMs = 1000;

export function listRowEntranceDelay(index: number): CSSProperties {
  return { animationDelay: `${rowBaseDelay + Math.min(index, maxStaggeredRows) * rowStagger}s` };
}

/**
 * True for the first render and for about a second after mount, then false. Rows rendered later
 * (Load more, search results) skip the entrance, so they don't fade up on every keystroke.
 */
export function useListEntrance() {
  const [isEntering, setIsEntering] = useState(true);
  useEffect(() => {
    const timeout = window.setTimeout(() => setIsEntering(false), entranceWindowMs);
    return () => window.clearTimeout(timeout);
  }, []);
  return isEntering;
}
