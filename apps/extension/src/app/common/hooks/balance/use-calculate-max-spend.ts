import { useCallback, useMemo } from 'react';

import { getBitcoinCoinSelectionService } from '@leather.io/services';

import { useNativeSegwitAccountRequest } from '@app/services/use-native-segwit-account-request';

export function useCalculateMaxBitcoinSpend() {
  const accountRequest = useNativeSegwitAccountRequest();
  const coinSelectionService = useMemo(() => getBitcoinCoinSelectionService(), []);

  return useCallback(
    (recipient = '', feeRate?: number) =>
      coinSelectionService.calculateMaxSpend(
        {
          account: accountRequest,
          recipient,
          feeRate,
        },
        undefined
      ),
    [accountRequest, coinSelectionService]
  );
}
