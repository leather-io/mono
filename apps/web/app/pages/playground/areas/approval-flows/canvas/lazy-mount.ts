import { type RefObject, startTransition, useEffect, useState } from 'react';

type NearListener = (isNear: boolean) => void;

const nearMargin = '1000px 0px';
const nearListeners = new WeakMap<Element, NearListener>();
const observerStore: { current: IntersectionObserver | null } = { current: null };

function getNearObserver() {
  if (observerStore.current) return observerStore.current;
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => nearListeners.get(entry.target)?.(entry.isIntersecting));
    },
    { rootMargin: nearMargin }
  );
  observerStore.current = observer;
  return observer;
}

export function useNearViewport(ref: RefObject<HTMLElement | null>, isEnabled: boolean) {
  const [isNear, setNear] = useState(!isEnabled);

  useEffect(() => {
    if (!isEnabled) {
      setNear(true);
      return;
    }
    const element = ref.current;
    if (!element) return;
    const observer = getNearObserver();
    nearListeners.set(element, next => startTransition(() => setNear(next)));
    observer.observe(element);
    return () => {
      observer.unobserve(element);
      nearListeners.delete(element);
    };
  }, [isEnabled, ref]);

  return isNear;
}
