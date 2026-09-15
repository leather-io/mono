import type { PointerEvent } from 'react';

import { Box, styled } from 'leather-styles/jsx';
import type { ColorToken } from 'leather-styles/tokens';

import type { MarketPriceSnapshot } from '@leather.io/models';

import {
  chartExtent,
  findNearestPointIndex,
  toChartPoints,
  toSvgPath,
} from './price-history.utils';

export const chartHeight = '120px';

interface PriceHistoryChartProps {
  prices: MarketPriceSnapshot[];
  color: ColorToken;
  hoveredIndex?: number;
  onHover(index: number | undefined): void;
}

export function PriceHistoryChart({
  prices,
  color,
  hoveredIndex,
  onHover,
}: PriceHistoryChartProps) {
  const points = toChartPoints(prices);
  const hovered = hoveredIndex === undefined ? undefined : points[hoveredIndex];

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const { left, width } = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - left) / width) * chartExtent;
    onHover(findNearestPointIndex(points, x));
  }

  return (
    <Box
      position="relative"
      height={chartHeight}
      color={color}
      cursor="crosshair"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => onHover(undefined)}
      data-testid="price-history-chart"
    >
      <styled.svg
        viewBox={`0 0 ${chartExtent} ${chartExtent}`}
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        display="block"
        overflow="visible"
        role="img"
        aria-label="Price history chart"
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
      {hovered ? (
        <>
          <Box
            position="absolute"
            top="0"
            bottom="0"
            borderLeft="1px dashed"
            borderColor="ink.text-subdued"
            pointerEvents="none"
            style={{ left: `${hovered.x}%` }}
          />
          <Box
            position="absolute"
            width="8px"
            height="8px"
            borderRadius="50%"
            bg="currentColor"
            transform="translate(-50%, -50%)"
            pointerEvents="none"
            style={{ left: `${hovered.x}%`, top: `${hovered.y}%` }}
          />
        </>
      ) : null}
    </Box>
  );
}
