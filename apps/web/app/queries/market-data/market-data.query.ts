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
    // The query depends on the serialized asset ids, so suppress lint warning about the original array
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['market-data-service-get-market-data-batch', assetIds, currency],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getMarketDataService().getMarketDataBatch(assets, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retryOnMount: false,
    staleTime: oneMinInMs,
    gcTime: oneMinInMs,
  } as const;
}
