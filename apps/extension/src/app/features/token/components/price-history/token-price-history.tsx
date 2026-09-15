import { useState } from 'react';

import { Stack, styled } from 'leather-styles/jsx';

import { formatPriceChangeText, getPriceChangeColor } from '@leather.io/features';
import type { FungibleCryptoAsset, HistoricalPeriod, Money } from '@leather.io/models';
import { SkeletonLoader } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';
import { usePriceHistory } from '@app/query/market-history/market-history.query';

import { PeriodSelector } from './period-selector';
import { calculatePriceChangeDelta } from './price-history.utils';

const defaultPeriod: HistoricalPeriod = '1d';

interface PriceChangeLineProps {
  changePercent: number;
  price?: Money;
}

function PriceChangeLine({ changePercent, price }: PriceChangeLineProps) {
  const priceChangeDelta =
    changePercent && price
      ? formatCurrency(calculatePriceChangeDelta(price, changePercent))
      : undefined;

  return (
    <styled.span
      textStyle="label.02"
      color={getPriceChangeColor(changePercent)}
      data-testid="token-details-price-change"
    >
      {formatPriceChangeText({ changePercent, priceChangeDelta })}
    </styled.span>
  );
}

interface TokenPriceHistoryProps {
  asset: FungibleCryptoAsset;
  price?: Money;
}

export function TokenPriceHistory({ asset, price }: TokenPriceHistoryProps) {
  const [period, setPeriod] = useState<HistoricalPeriod>(defaultPeriod);
  const history = usePriceHistory(asset, period);

  return (
    <Stack gap="space.03" px="space.05" pb="space.02">
      <Stack gap="space.01">
        <styled.span textStyle="heading.05" data-testid="token-details-price">
          {price ? formatCurrency(price) : '—'}
        </styled.span>
        <SkeletonLoader isLoading={history.state === 'loading'} height="20px" width="140px">
          {history.state === 'success' ? (
            <PriceChangeLine changePercent={history.value.changePercentage} price={price} />
          ) : null}
        </SkeletonLoader>
      </Stack>
      <PeriodSelector value={period} onChange={setPeriod} />
    </Stack>
  );
}
