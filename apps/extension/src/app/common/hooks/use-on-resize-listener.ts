import { useEffect } from 'react';

export function useOnResizeListener(callback: () => void) {
  useEffect(() => {
    function onResize() {
      callback();
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [callback]);
}
