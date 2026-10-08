import {
  type HistoricalPeriod,
  type MarketPriceHistory,
  type MarketPriceSnapshot,
  type MarketStats,
  type Money,
  historicalPeriods,
} from '@leather.io/models';
import { createMoney, subtractMoney } from '@leather.io/utils';

export const chartExtent = 100;
const minChartSnapshots = 2;
const timeOfDayPeriods: HistoricalPeriod[] = ['1d', '1w'];

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});
const dateFormat = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export interface PriceChange {
  changePercent: number;
  delta?: Money;
}

interface ChartPoint {
  x: number;
  y: number;
}

function calculatePriceChangeDelta(price: Money, changePercent: number): Money {
  const deltaAmount = price.amount.multipliedBy(changePercent).dividedBy(100);
  return createMoney(deltaAmount, price.symbol);
}

function calculateChangePercent(from: Money, to: Money): number {
  if (from.amount.isZero()) return 0;
  return to.amount.minus(from.amount).dividedBy(from.amount).multipliedBy(100).toNumber();
}

export function getPriceChange(
  history: MarketPriceHistory,
  hovered: MarketPriceSnapshot | undefined,
  price: Money | undefined
): PriceChange {
  if (hovered) {
    const first = history.prices[0];
    return {
      changePercent: calculateChangePercent(first.price, hovered.price),
      delta: subtractMoney(hovered.price, first.price),
    };
  }
  const { changePercentage } = history;
  return {
    changePercent: changePercentage,
    delta:
      price && changePercentage ? calculatePriceChangeDelta(price, changePercentage) : undefined,
  };
}

export function getUnavailablePeriods(stats: MarketStats): HistoricalPeriod[] {
  return historicalPeriods.filter(period => typeof stats.priceChange[period] !== 'number');
}

export function formatSnapshotTime(timestamp: number, period: HistoricalPeriod): string {
  return (timeOfDayPeriods.includes(period) ? dateTimeFormat : dateFormat).format(timestamp);
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

export function findNearestPointIndex(points: ChartPoint[], x: number): number {
  return points.reduce(
    (nearest, point, index) => {
      const distance = Math.abs(point.x - x);
      return distance < nearest.distance ? { index, distance } : nearest;
    },
    { index: 0, distance: Number.POSITIVE_INFINITY }
  ).index;
}
