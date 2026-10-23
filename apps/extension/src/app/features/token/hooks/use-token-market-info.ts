import type { FungibleCryptoAsset, Money } from '@leather.io/models';

import { useAssetDescription } from '@app/query/assets/fungible-asset-info.query';
import { useMarketData } from '@app/query/common/market-data/market-data.query';

interface TokenMarketInfo {
  price?: Money;
  descriptionText: string;
  isLoading: boolean;
  hasError: boolean;
}

export function useTokenMarketInfo(asset: FungibleCryptoAsset): TokenMarketInfo {
  const marketData = useMarketData(asset);
  const description = useAssetDescription(asset);

  const isLoading = marketData.state === 'loading';
  const hasError = marketData.state === 'error';

  const price = marketData.state === 'success' ? marketData.value.price : undefined;
  const descriptionText =
    description.state === 'success' ? (description.value.description ?? '') : '';

  return {
    price,
    descriptionText,
    isLoading,
    hasError,
  };
}
