import { styled } from 'leather-styles/jsx';
import type { ColorToken } from 'leather-styles/tokens';

import type { MarketPriceSnapshot } from '@leather.io/models';

import { chartExtent, toChartPoints, toSvgPath } from './price-history.utils';

export const chartHeight = '120px';

interface PriceHistoryChartProps {
  prices: MarketPriceSnapshot[];
  color: ColorToken;
}

export function PriceHistoryChart({ prices, color }: PriceHistoryChartProps) {
  const points = toChartPoints(prices);

  return (
    <styled.svg
      viewBox={`0 0 ${chartExtent} ${chartExtent}`}
      preserveAspectRatio="none"
      width="100%"
      height={chartHeight}
      display="block"
      overflow="visible"
      color={color}
      role="img"
      aria-label="Price history chart"
      data-testid="price-history-chart"
    >
      <path
        d={toSvgPath(points)}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </styled.svg>
  );
}
