import { useAccountBaseSwapAssetsQuery } from '@/features/swap/swap-state/swap.queries';
import { useAccountRequest } from '@/hooks/use-account-request';

import { getSwapService } from '@leather.io/services';

export function usePreloadSwapData() {
  const accountRequest = useAccountRequest();

  useAccountBaseSwapAssetsQuery({
    swapService: getSwapService(),
    accountRequest,
  });
}
