import { QueryFunctionContext, useQuery } from '@tanstack/react-query';
import { useQuoteCurrency } from '~/store/quote-currency';

import { FungibleCryptoAsset, QuoteCurrency } from '@leather.io/models';
import { getMarketDataService } from '@leather.io/services';
import { getAssetId, oneMinInMs, serializeAssetId } from '@leather.io/utils';

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
  const { quoteCurrency } = useQuoteCurrency();
  return useQuery(createMarketDataQueryOptions(asset, quoteCurrency));
}

export function createMarketDataBatchQueryOptions(
  assets: FungibleCryptoAsset[],
  currency: QuoteCurrency
) {
  const assetIds = assets.map(asset => serializeAssetId(getAssetId(asset)));
  return {
    queryKey: ['market-data-service-get-market-data-batch', assetIds, currency],
    queryFn: ({ signal, meta }: QueryFunctionContext<
      ['market-data-service-get-market-data-batch', string[], QuoteCurrency],
      never,
      { assets: FungibleCryptoAsset[] }
    >) => {
      const { assets: assetsForQuery } = meta;
      return getMarketDataService().getMarketDataBatch(assetsForQuery, signal);
    },
    meta: { assets },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retryOnMount: false,
    staleTime: oneMinInMs,
    gcTime: oneMinInMs,
  } as const;
}
