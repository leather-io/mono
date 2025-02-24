import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQueries, useQuery } from '@tanstack/react-query';

import { FiatCurrency, FungibleCryptoAssetInfo } from '@leather.io/models';
import { getMarketDataService } from '@leather.io/services';
import { oneMinInMs } from '@leather.io/utils';

export function createMarketDataQueryOptions(
  asset: FungibleCryptoAssetInfo,
  currency: FiatCurrency
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

export function useMarketDataQueries(assets: FungibleCryptoAssetInfo[]) {
  const { fiatCurrencyPreference } = useSettings();
  return useQueries({
    queries: assets.map(token => createMarketDataQueryOptions(token, fiatCurrencyPreference)),
  });
}
