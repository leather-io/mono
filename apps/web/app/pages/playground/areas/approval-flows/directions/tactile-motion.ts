import { useEffect, useRef } from 'react';

import { css } from 'leather-styles/css';

import { useApprovalOptions } from '../pattern/approval-options';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const riseDuration = 440;
const riseStagger = 60;
const springEasing = 'cubic-bezier(0.34, 1.4, 0.64, 1)';
const riseFrames: Keyframe[] = [
  { opacity: 0, transform: 'translateY(14px) scale(0.98)' },
  { opacity: 1, transform: 'translateY(0) scale(1)' },
];

export const tactilePress = css({
  transition: 'transform 140ms cubic-bezier(0.34, 1.4, 0.64, 1), background-color 140ms ease',
  _active: { transform: 'scale(0.97)' },
  _motionReduce: { transition: 'none', _active: { transform: 'none' } },
});

function prefersReducedMotion() {
  try {
    return window.matchMedia(reducedMotionQuery).matches;
  } catch {
    return false;
  }
}

export function useTactileRise<T extends HTMLElement>(order: number) {
  const ref = useRef<T>(null);
  const { isSolo } = useApprovalOptions();
  useEffect(() => {
    const node = ref.current;
    if (!isSolo || !node || typeof node.animate !== 'function' || prefersReducedMotion()) {
      return undefined;
    }
    const animation = node.animate(riseFrames, {
      duration: riseDuration,
      delay: order * riseStagger,
      easing: springEasing,
      fill: 'backwards',
    });
    return () => animation.cancel();
  }, [isSolo, order]);
  return ref;
}
