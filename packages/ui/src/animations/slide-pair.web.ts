import type { Transition, Variants } from 'framer-motion';

type Side = 'left' | 'right' | 'up' | 'down';

interface SlidePairOptions {
  distance?: number;
  duration?: number;
}

interface SlideAnimation {
  variants: Variants;
  transition: Transition;
}

export function slidePair(
  side: Side,
  { distance = 5, duration = 0.15 }: SlidePairOptions = {}
): { first: SlideAnimation; second: SlideAnimation } {
  const isHorizontal = side === 'left' || side === 'right';
  const base = side === 'left' || side === 'up' ? -distance : distance;
  const axis = isHorizontal ? 'x' : 'y';

  function make(delta: number): SlideAnimation {
    return {
      variants: {
        initial: { opacity: 0, [axis]: delta },
        animate: { opacity: 1, [axis]: 0 },
        exit: { opacity: 0, [axis]: delta },
      },
      transition: { duration },
    };
  }

  return {
    first: make(base),
    second: make(-base),
  };
}
