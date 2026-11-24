import { useState } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { formatPriceChangeText, getPriceChangeColor } from '@leather.io/features';
import type { FungibleCryptoAsset, HistoricalPeriod, Money } from '@leather.io/models';
import { SkeletonLoader } from '@leather.io/ui';

import { formatCurrency } from '@app/common/currency-formatter';
import { usePriceHistory } from '@app/query/market-history/market-history.query';
import { useMarketStats } from '@app/query/market-stats/market-stats.query';

import { PeriodSelector } from './period-selector';
import { PriceHistoryChart, chartHeight } from './price-history-chart';
import {
  type PriceChange,
  formatSnapshotTime,
  getPriceChange,
  getUnavailablePeriods,
  hasEnoughSnapshots,
} from './price-history.utils';

const defaultPeriod: HistoricalPeriod = '1d';
const emptyValue = '—';

interface PriceChangeLineProps extends PriceChange {
  timestamp?: string;
}

function PriceChangeLine({ changePercent, delta, timestamp }: PriceChangeLineProps) {
  return (
    <Flex gap="space.01" alignItems="baseline" textStyle="label.03">
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
  const stats = useMarketStats(asset);

  const unavailablePeriods = stats.state === 'success' ? getUnavailablePeriods(stats.value) : [];
  const periodHistory =
    history.state === 'success' && !unavailablePeriods.includes(period) ? history.value : undefined;
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
        <styled.span textStyle="label.01" data-testid="token-details-price">
          {displayedPrice ? formatCurrency(displayedPrice) : emptyValue}
        </styled.span>
        <Box opacity={history.isPlaceholderData ? 0.5 : 1}>
          <SkeletonLoader isLoading={history.state === 'loading'} height="20px" width="140px">
            {change ? (
              <PriceChangeLine
                {...change}
                timestamp={hovered ? formatSnapshotTime(hovered.timestamp, period) : undefined}
              />
            ) : (
              <styled.span
                textStyle="label.02"
                color="ink.text-subdued"
                data-testid="token-details-price-change"
              >
                {emptyValue}
              </styled.span>
            )}
          </SkeletonLoader>
        </Box>
      </Stack>
      <Box opacity={history.isPlaceholderData ? 0.5 : 1}>
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
      </Box>
      <PeriodSelector
        value={period}
        disabledPeriods={unavailablePeriods}
        onChange={handlePeriodChange}
      />
    </Stack>
  );
}
