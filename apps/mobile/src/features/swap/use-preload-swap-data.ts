import { useAccountRequest } from '@/hooks/use-account-request';

import { getSwapService } from '@leather.io/services';
import { useAccountBaseSwapAssetsQuery } from '@leather.io/state/swap';

export function usePreloadSwapData() {
  const accountRequest = useAccountRequest();

  useAccountBaseSwapAssetsQuery({
    swapService: getSwapService(),
    accountRequest,
  });
}
