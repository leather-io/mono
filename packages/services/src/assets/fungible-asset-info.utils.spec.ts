import { createMoney } from '@leather.io/utils';

import { mapPriceHistory } from './fungible-asset-info.utils';

describe(mapPriceHistory.name, () => {
  it('should convert price history amount to money and timestamp string to unix format', () => {
    const priceHistory = [
      {
        price: 1,
        timestamp: '2025-06-26T12:00:00.000Z',
      },
    ];

    const mappedPriceHistory = mapPriceHistory(priceHistory);

    expect(mappedPriceHistory).toEqual([
      {
        price: createMoney(100, 'USD'),
        timestamp: 1750939200000,
      },
    ]);
  });
});
