import { useCallback, useState } from 'react';

export function useFakeLoading() {
  const [fakeLoading, setFakeLoading] = useState(false);

  const startFakeLoading = useCallback((durationMs = 1000) => {
    setFakeLoading(true);
    setTimeout(() => {
      setFakeLoading(false);
    }, durationMs);
  }, []);

  return { fakeLoading, startFakeLoading };
}
