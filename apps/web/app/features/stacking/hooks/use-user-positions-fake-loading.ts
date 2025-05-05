import { useEffect } from 'react';

import { useFakeLoading } from '~/utils/fake-loading';

export function useUserPositionsFakeLoading(isLoading: boolean) {
  const { fakeLoading, startFakeLoading } = useFakeLoading();

  useEffect(() => {
    if (!isLoading) {
      startFakeLoading();
    }
  }, [isLoading, startFakeLoading]);

  return { fakeLoading };
}
