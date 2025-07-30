import { useEffect, useState } from 'react';

export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    function check() {
      if (typeof window === 'undefined') {
        setIsTouch(false);
        return;
      }

      const result =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (window.matchMedia?.('(pointer: coarse)').matches ?? false);

      setIsTouch(result);
    }

    check();
  }, []);

  return isTouch;
}
