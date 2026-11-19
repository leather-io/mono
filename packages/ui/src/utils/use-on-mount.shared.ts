import { useEffect } from 'react';

export function useOnMount(effect: () => void | (() => void) | Promise<unknown>) {
  useEffect(() => {
    const fn = effect();
    return () => (typeof fn === 'function' ? fn() : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
