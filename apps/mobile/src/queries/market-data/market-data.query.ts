import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { FungibleCryptoAssetInfo, QuoteCurrency } from '@leather.io/models';
import { getMarketDataService } from '@leather.io/services';
import { oneMinInMs } from '@leather.io/utils';

/**
 * Export is used for tests
 * @internal
 */
export function createMarketDataQueryOptions(
  asset: FungibleCryptoAssetInfo,
  currency: QuoteCurrency
) {
  return {
    queryKey: ['market-data-service-get-market-data', asset, currency],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getMarketDataService().getMarketData(asset, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retryOnMount: false,
    staleTime: oneMinInMs,
    gcTime: oneMinInMs,
  } as const;
}

export function useMarketDataQuery(asset: FungibleCryptoAssetInfo) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery(createMarketDataQueryOptions(asset, fiatCurrencyPreference));
}
