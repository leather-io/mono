import { createMoney } from '@leather.io/utils';

import { convertApiPriceSnapshots } from './market-history.utils';

describe(convertApiPriceSnapshots.name, () => {
  it('should convert price history amount to money and timestamp string to unix format', () => {
    const apiPriceHistory = {
      changePercentage: 1,
      snapshots: [
        {
          price: 1,
          timestamp: '2025-06-26T12:00:00.000Z',
        },
      ],
    };

    const mappedPriceHistory = convertApiPriceSnapshots(apiPriceHistory.snapshots);

    expect(mappedPriceHistory).toEqual([
      {
        price: createMoney(100, 'USD'),
        timestamp: 1750939200000,
      },
    ]);
  });
});
