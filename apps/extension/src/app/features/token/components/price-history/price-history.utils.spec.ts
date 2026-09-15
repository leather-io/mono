import type { MarketPriceHistory } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import {
  findNearestPointIndex,
  getPriceChange,
  toChartPoints,
  toSvgPath,
} from './price-history.utils';

function snapshot(timestamp: number, usd: number) {
  return { timestamp, price: createMoney(usd * 100, 'USD') };
}

describe('getPriceChange', () => {
  const history: MarketPriceHistory = {
    period: '1d',
    changePercentage: 5,
    prices: [snapshot(0, 100), snapshot(1, 120), snapshot(2, 110)],
  };

  it('uses the server change and the live price at rest', () => {
    expect(getPriceChange(history, undefined, createMoney(20_000, 'USD'))).toEqual({
      changePercent: 5,
      delta: createMoney(1_000, 'USD'),
    });
  });

  it('measures from the first snapshot to the hovered one', () => {
    expect(getPriceChange(history, history.prices[1], undefined)).toEqual({
      changePercent: 20,
      delta: createMoney(2_000, 'USD'),
    });
  });
});

describe('toChartPoints', () => {
  it('maps the time range to x and the price range to y, higher prices nearer the top', () => {
    expect(toChartPoints([snapshot(0, 10), snapshot(50, 30), snapshot(100, 20)])).toEqual([
      { x: 0, y: 100 },
      { x: 50, y: 0 },
      { x: 100, y: 50 },
    ]);
  });

  it('centres a flat price series', () => {
    expect(toChartPoints([snapshot(0, 10), snapshot(100, 10)])).toEqual([
      { x: 0, y: 50 },
      { x: 100, y: 50 },
    ]);
  });
});

describe('toSvgPath', () => {
  it('starts with a move and continues with lines', () => {
    expect(
      toSvgPath([
        { x: 0, y: 100 },
        { x: 100, y: 0 },
      ])
    ).toBe('M0.00 100.00 L100.00 0.00');
  });
});

describe('findNearestPointIndex', () => {
  it('returns the index of the point closest to x', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 100, y: 0 },
    ];
    expect(findNearestPointIndex(points, 60)).toBe(1);
    expect(findNearestPointIndex(points, 80)).toBe(2);
  });
});
