import { useState } from 'react';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { formatPriceChangeText, getPriceChangeColor } from '@leather.io/features';
import type { FungibleCryptoAsset, HistoricalPeriod, Money } from '@leather.io/models';
import { SkeletonLoader } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';
import { usePriceHistory } from '@app/query/market-history/market-history.query';

import { PeriodSelector } from './period-selector';
import { PriceHistoryChart, chartHeight } from './price-history-chart';
import {
  type PriceChange,
  formatSnapshotTime,
  getPriceChange,
  hasEnoughSnapshots,
} from './price-history.utils';

const defaultPeriod: HistoricalPeriod = '1d';

interface PriceChangeLineProps extends PriceChange {
  timestamp?: string;
}

function PriceChangeLine({ changePercent, delta, timestamp }: PriceChangeLineProps) {
  return (
    <Flex gap="space.01" alignItems="baseline" textStyle="label.02">
      <styled.span
        color={getPriceChangeColor(changePercent)}
        data-testid="token-details-price-change"
      >
        {formatPriceChangeText({
          changePercent,
          priceChangeDelta: delta ? formatCurrency(delta) : undefined,
        })}
      </styled.span>
      {timestamp ? <styled.span color="ink.text-subdued">· {timestamp}</styled.span> : null}
    </Flex>
  );
}

interface TokenPriceHistoryProps {
  asset: FungibleCryptoAsset;
  price?: Money;
}

export function TokenPriceHistory({ asset, price }: TokenPriceHistoryProps) {
  const [period, setPeriod] = useState<HistoricalPeriod>(defaultPeriod);
  const [hoveredIndex, setHoveredIndex] = useState<number>();
  const history = usePriceHistory(asset, period);

  const periodHistory = history.state === 'success' ? history.value : undefined;
  const prices = periodHistory?.prices ?? [];
  const hovered = hoveredIndex === undefined ? undefined : prices[hoveredIndex];
  const change = periodHistory ? getPriceChange(periodHistory, hovered, price) : undefined;
  const displayedPrice = hovered?.price ?? price;

  function handlePeriodChange(nextPeriod: HistoricalPeriod) {
    setHoveredIndex(undefined);
    setPeriod(nextPeriod);
  }

  return (
    <Stack gap="space.03" px="space.05" pb="space.02">
      <Stack gap="space.01">
        <styled.span textStyle="heading.05" data-testid="token-details-price">
          {displayedPrice ? formatCurrency(displayedPrice) : '—'}
        </styled.span>
        <SkeletonLoader isLoading={history.state === 'loading'} height="20px" width="140px">
          {change ? (
            <PriceChangeLine
              {...change}
              timestamp={hovered ? formatSnapshotTime(hovered.timestamp, period) : undefined}
            />
          ) : null}
        </SkeletonLoader>
      </Stack>
      <SkeletonLoader isLoading={history.state === 'loading'} height={chartHeight} width="100%">
        {periodHistory && hasEnoughSnapshots(prices) ? (
          <PriceHistoryChart
            prices={prices}
            color={getPriceChangeColor(periodHistory.changePercentage)}
            hoveredIndex={hoveredIndex}
            onHover={setHoveredIndex}
          />
        ) : null}
      </SkeletonLoader>
      <PeriodSelector value={period} onChange={handlePeriodChange} />
    </Stack>
  );
}
