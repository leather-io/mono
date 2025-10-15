import { toFetchState } from '@/components/loading';
import { useAssetDescriptionQuery } from '@/queries/assets/fungible-asset-info.query';
import { useMarketDataQuery } from '@/queries/market-data/market-data.query';
import { usePriceChangePercentage } from '@/queries/market-history/market-history.query';

import { FungibleCryptoAsset } from '@leather.io/models';

export function useGetTokenDetails({ asset }: { asset: FungibleCryptoAsset }) {
  const marketData = useMarketDataQuery(asset);
  const priceChangePercentage = usePriceChangePercentage(asset);
  const assetDescriptionQuery = useAssetDescriptionQuery(asset);
  return {
    tokenDetails: toFetchState({
      data: {
        description: assetDescriptionQuery.data?.description,
        price: marketData.data?.price,
        changePercent: priceChangePercentage.state === 'success' ? priceChangePercentage.value : 0,
      },
      isLoading:
        marketData.isLoading ||
        priceChangePercentage.state === 'loading' ||
        assetDescriptionQuery.isLoading,
      isError:
        marketData.isError ||
        priceChangePercentage.state === 'error' ||
        assetDescriptionQuery.isError,
      error:
        marketData.error ||
        (priceChangePercentage.state === 'error'
          ? new Error(priceChangePercentage.errorMessage)
          : null) ||
        assetDescriptionQuery.error,
    }),
  };
}
