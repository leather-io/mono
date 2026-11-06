import {
  type ElementType,
  type HTMLAttributes,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { css, cx } from 'leather-styles/css';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

// The hidden state only exists once JS has run (`data-reveal` is never rendered on the server),
// so the SSR HTML, crawlers and no-JS visitors always get fully visible content.
const revealStyles = css({
  '&[data-reveal]': { transition: 'opacity 0.6s cubic-bezier(0.44, 0, 0.56, 1)' },
  '&[data-reveal=hidden]': { opacity: 0 },
});

type RevealState = 'idle' | 'hidden' | 'shown';

function isInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight;
}

interface RevealProps extends HTMLAttributes<HTMLElement> {
  /** Share of the element (0–1) that must be on screen before it fades in. Defaults to 0.5. */
  threshold?: number;
  /** Element to render. Defaults to `div`. */
  as?: ElementType;
}

/**
 * Fades its children in (opacity only, 0.6s) the first time they scroll into view, like the
 * Framer site's section headings. Content already on screen at hydration, and everything under
 * `prefers-reduced-motion: reduce`, is left as is. Layout never changes: only opacity animates.
 */
export function Reveal({
  threshold = 0.5,
  as: Component = 'div',
  className,
  ...props
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<RevealState>('idle');

  // Hide below-the-fold content before the browser paints the hydrated page
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia(reducedMotionQuery).matches || isInViewport(element)) return;
    setState('hidden');
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (state !== 'hidden' || !element) return;
    // An element taller than the viewport can never be 50% visible; cap the threshold for it
    const reachable = (window.innerHeight / Math.max(element.offsetHeight, 1)) * 0.9;
    const effectiveThreshold = Math.min(threshold, reachable);
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries.find(item => item.target === element);
        if (!entry?.isIntersecting || entry.intersectionRatio < effectiveThreshold) return;
        setState('shown');
        observer.disconnect();
      },
      { threshold: effectiveThreshold }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [state, threshold]);

  return (
    <Component
      ref={ref}
      className={cx(revealStyles, className)}
      data-reveal={state === 'idle' ? undefined : state}
      {...props}
    />
  );
}
