import { type RefObject, useEffect, useState } from 'react';

import { usePrefersReducedMotion } from '~/pages/marketing/shared/lottie-animation';

/**
 * Seconds of animation time for decorative art. Runs only while `enabled`, the element is on
 * screen and motion is allowed; otherwise it holds, starting at `startAt`, so the static frame is
 * also the first frame.
 */
export function useArtClock(ref: RefObject<HTMLElement | null>, startAt: number, enabled = true) {
  const reducedMotion = usePrefersReducedMotion();
  const canAnimate = reducedMotion === false;
  const [time, setTime] = useState(startAt);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!canAnimate || !element) return;
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setIsVisible(!!entry?.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, canAnimate]);

  useEffect(() => {
    if (!canAnimate || !isVisible || !enabled) return;
    let frame = 0;
    let last: number | undefined;
    function tick(now: number) {
      const dt = last === undefined ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      setTime(t => t + dt);
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [canAnimate, isVisible, enabled]);

  return canAnimate ? time : startAt;
}
