export const toastPopEasing = 'cubic-bezier(0.23, 1, 0.32, 1)';
export const toastInOutEasing = 'cubic-bezier(0.65, 0, 0.35, 1)';
export const toastExitDelayMs = 160;
const toastEnterEasing = 'cubic-bezier(0, 0.45, 0.6, 1)';
const toastEnterDurationMs = 250;
const toastEnterOffsetY = -20;
const toastEnterScale = 0.9;
const toastExitDurationMs = 260;
const toastExitScale = 0.9;

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function animateToastEnter(element: Element | null) {
  if (!element) return;
  const reduceMotion = prefersReducedMotion();
  element.animate(
    [
      {
        opacity: 0,
        transform: reduceMotion
          ? 'none'
          : `translateY(${toastEnterOffsetY}px) scale(${toastEnterScale})`,
      },
      { opacity: 1, transform: 'none' },
    ],
    { duration: toastEnterDurationMs, easing: toastEnterEasing, fill: 'backwards' }
  );
}

export async function animateToastExit(element: Element | null) {
  if (!element) return;
  const reduceMotion = prefersReducedMotion();
  const currentTransform = getComputedStyle(element).transform;
  const baseTransform = currentTransform === 'none' ? '' : currentTransform;
  const animation = element.animate(
    [
      { opacity: 1, transform: `${baseTransform} scale(1)` },
      {
        opacity: 0,
        transform: `${baseTransform} scale(${reduceMotion ? 1 : toastExitScale})`,
      },
    ],
    {
      delay: reduceMotion ? 0 : toastExitDelayMs,
      duration: toastExitDurationMs,
      easing: toastInOutEasing,
      fill: 'forwards',
    }
  );
  await animation.finished.catch(() => undefined);
}
