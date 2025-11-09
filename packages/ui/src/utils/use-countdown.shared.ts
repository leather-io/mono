import { useEffect, useState } from 'react';

export function useCountdown(until: number) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (!until) return;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function tick() {
      const diffMs = until - Date.now();
      const next = Math.max(0, Math.ceil(diffMs / 1000));
      setRemainingSeconds(prev => (prev === next ? prev : next));
      if (diffMs <= 0) return;
      const remainder = diffMs % 1000;
      const delay = remainder === 0 ? 1000 : remainder;
      timer = setTimeout(tick, delay);
    }

    tick();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [until]);

  return remainingSeconds;
}
