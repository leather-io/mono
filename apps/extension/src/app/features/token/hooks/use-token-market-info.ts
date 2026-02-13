import type { FungibleCryptoAsset, Money } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { formatCurrency } from '@app/common/currency-formatter';
import { useAssetDescription } from '@app/query/assets/fungible-asset-info.query';
import { useMarketData } from '@app/query/common/market-data/market-data.query';
import { usePriceChangePercentage } from '@app/query/market-history/market-history.query';

function calculatePriceChangeDelta(price: Money, changePercent: number): Money {
  const deltaAmount = price.amount.multipliedBy(changePercent).dividedBy(100);
  return createMoney(deltaAmount, price.symbol);
}
interface TokenMarketInfo {
  price?: Money;
  changePercent: number;
  priceChangeDelta?: string;
  descriptionText: string;
  isLoading: boolean;
  hasError: boolean;
}

export function useTokenMarketInfo(asset: FungibleCryptoAsset): TokenMarketInfo {
  const marketData = useMarketData(asset);
  const description = useAssetDescription(asset);
  const priceChange = usePriceChangePercentage(asset);

  const isLoading = marketData.state === 'loading';
  const hasError = marketData.state === 'error';

  const price = marketData.state === 'success' ? marketData.value.price : undefined;
  const changePercent = priceChange.state === 'success' ? priceChange.value : 0;
  const descriptionText =
    description.state === 'success' ? (description.value.description ?? '') : '';

  const priceChangeDelta =
    changePercent && price
      ? formatCurrency(calculatePriceChangeDelta(price, changePercent))
      : undefined;

  return {
    price,
    changePercent,
    priceChangeDelta,
    descriptionText,
    isLoading,
    hasError,
  };
}
