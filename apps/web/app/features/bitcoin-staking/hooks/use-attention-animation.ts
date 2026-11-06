import { useEffect, useRef } from 'react';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

export const shakeKeyframes: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-6px)' },
  { transform: 'translateX(5px)' },
  { transform: 'translateX(-3px)' },
  { transform: 'translateX(2px)' },
  { transform: 'translateX(0)' },
];

export const shakeTiming: KeyframeAnimationOptions = { duration: 360, easing: 'ease-out' };

export function useAttentionAnimation<T extends HTMLElement>(
  trigger: number,
  keyframes: Keyframe[],
  timing: KeyframeAnimationOptions
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (trigger === 0) return;
    if (window.matchMedia(reducedMotionQuery).matches) return;
    ref.current?.animate(keyframes, timing);
  }, [trigger, keyframes, timing]);

  return ref;
}
