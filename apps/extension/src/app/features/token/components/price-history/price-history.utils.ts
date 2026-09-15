import type { MarketPriceSnapshot, Money } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

export const chartExtent = 100;
const minChartSnapshots = 2;

interface ChartPoint {
  x: number;
  y: number;
}

export function calculatePriceChangeDelta(price: Money, changePercent: number): Money {
  const deltaAmount = price.amount.multipliedBy(changePercent).dividedBy(100);
  return createMoney(deltaAmount, price.symbol);
}

export function hasEnoughSnapshots(prices: MarketPriceSnapshot[]) {
  return prices.length >= minChartSnapshots;
}

export function toChartPoints(prices: MarketPriceSnapshot[]): ChartPoint[] {
  const timestamps = prices.map(snapshot => snapshot.timestamp);
  const values = prices.map(snapshot => snapshot.price.amount.toNumber());
  const minTime = Math.min(...timestamps);
  const timeSpan = Math.max(...timestamps) - minTime;
  const minValue = Math.min(...values);
  const valueSpan = Math.max(...values) - minValue;

  return prices.map(({ timestamp, price }) => ({
    x: timeSpan === 0 ? 0 : ((timestamp - minTime) / timeSpan) * chartExtent,
    y:
      valueSpan === 0
        ? chartExtent / 2
        : chartExtent - ((price.amount.toNumber() - minValue) / valueSpan) * chartExtent,
  }));
}

export function toSvgPath(points: ChartPoint[]): string {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
}
