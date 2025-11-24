import { createMockSip10Balance } from '@leather.io/services';

import { sortSip10Balances } from './sort-sip10-balances';

describe(sortSip10Balances.name, () => {
  it('should sort values with the highest fiat first', () => {
    const sorted = [50, 3, 1].map(value =>
      createMockSip10Balance({
        quote: { availableBalance: { amount: value } },
      })
    );

    const unsorted = [...sorted].sort(() => (Math.random() > 0.5 ? 1 : -1));
    expect(unsorted.sort(sortSip10Balances)).toEqual(sorted);
  });

  it('should be stable when items have same value', () => {
    const sorted = Array(3)
      .fill(0)
      .map((_, index) =>
        createMockSip10Balance({
          quote: { availableBalance: { amount: 50 } },
          asset: { name: index.toString() },
        })
      );

    const unsorted = [...sorted].sort(() => (Math.random() > 0.5 ? 1 : -1));
    expect(unsorted.sort(sortSip10Balances)).toEqual(unsorted);
  });
});
