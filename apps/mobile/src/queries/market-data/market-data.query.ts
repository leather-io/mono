import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { FungibleCryptoAsset, QuoteCurrency } from '@leather.io/models';
import { getMarketDataService } from '@leather.io/services';
import { oneMinInMs } from '@leather.io/utils';

/**
 * Export is used for tests
 * @internal
 */
export function createMarketDataQueryOptions(asset: FungibleCryptoAsset, currency: QuoteCurrency) {
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

export function useMarketDataQuery(asset: FungibleCryptoAsset) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery(createMarketDataQueryOptions(asset, fiatCurrencyPreference));
}
