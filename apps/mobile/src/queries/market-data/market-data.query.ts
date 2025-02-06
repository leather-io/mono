import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQueries, useQuery } from '@tanstack/react-query';

import { FiatCurrency, FungibleCryptoAssetInfo } from '@leather.io/models';
import { getMarketDataService } from '@leather.io/services';
import { oneMinInMs } from '@leather.io/utils';

export function createMarketDataQueryOptions(
  token: FungibleCryptoAssetInfo,
  currency: FiatCurrency
) {
  return {
    queryKey: ['market-data-service-get-market-data', token, currency],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getMarketDataService().getMarketData(token, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retryOnMount: false,
    staleTime: oneMinInMs,
    gcTime: oneMinInMs,
  } as const;
}

export function useMarketDataQuery(token: FungibleCryptoAssetInfo) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery(createMarketDataQueryOptions(token, fiatCurrencyPreference));
}

export function useMarketDataQueries(tokens: FungibleCryptoAssetInfo[]) {
  const { fiatCurrencyPreference } = useSettings();
  return useQueries({
    queries: tokens.map(token => createMarketDataQueryOptions(token, fiatCurrencyPreference)),
  });
}
