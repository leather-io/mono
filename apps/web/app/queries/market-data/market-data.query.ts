import { QueryFunctionContext, useQuery } from '@tanstack/react-query';
import { useFiatCurrency } from '~/store/fiat-currency';

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
  const { fiatCurrency } = useFiatCurrency();
  return useQuery(createMarketDataQueryOptions(asset, fiatCurrency));
}
