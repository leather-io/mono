import { useEffect, useState } from 'react';

import { useAccountBaseSwapAssetsQuery } from '@/features/swap/swap-state/swap.queries';
import { useAccountRequest } from '@/hooks/use-account-request';

import { getSwapService } from '@leather.io/services';

const preloadDelay = 5000;

function useDelayedFlag() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timerId = setTimeout(() => setIsReady(true), preloadDelay);
    return () => clearTimeout(timerId);
  }, []);

  return isReady;
}

export function usePreloadSwapData() {
  const isReadyToPreload = useDelayedFlag();
  const accountRequest = useAccountRequest();

  useAccountBaseSwapAssetsQuery({
    swapService: getSwapService(),
    accountRequest,
    queryOptions: {
      enabled: isReadyToPreload,
    },
  });
}
