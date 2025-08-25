import { toFetchState } from '@/components/loading';
import {
  useAssetDescriptionQuery,
  useAssetPriceChangeQuery,
} from '@/queries/assets/fungible-asset-info.query';
import { useMarketDataQuery } from '@/queries/market-data/market-data.query';

import { FungibleCryptoAsset } from '@leather.io/models';

export function useGetTokenDetails({ asset }: { asset: FungibleCryptoAsset }) {
  const marketData = useMarketDataQuery(asset);
  const assetPriceChangeQuery = useAssetPriceChangeQuery(asset);
  const assetDescriptionQuery = useAssetDescriptionQuery(asset);

  return {
    tokenDetails: toFetchState({
      data: {
        description: assetDescriptionQuery.data?.description,
        price: marketData.data?.price,
        changePercent: assetPriceChangeQuery.data?.changePercent ?? 0,
      },
      isLoading:
        marketData.isLoading || assetPriceChangeQuery.isLoading || assetDescriptionQuery.isLoading,
      isError: marketData.isError || assetPriceChangeQuery.isError || assetDescriptionQuery.isError,
      error: marketData.error || assetPriceChangeQuery.error || assetDescriptionQuery.error,
    }),
  };
}
