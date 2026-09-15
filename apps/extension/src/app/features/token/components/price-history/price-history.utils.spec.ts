import { createMoney } from '@leather.io/utils';

import { toChartPoints, toSvgPath } from './price-history.utils';

function snapshot(timestamp: number, usd: number) {
  return { timestamp, price: createMoney(usd * 100, 'USD') };
}

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
