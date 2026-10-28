import { describe, expect, it } from 'vitest';

import { pullPriceDataFromAvailableResponses } from './market-data.utils';

describe(pullPriceDataFromAvailableResponses.name, () => {
  it('skips vendors that respond without a price', () => {
    const prices = pullPriceDataFromAvailableResponses([
      { result: { price: 1.5 }, selector: () => 1.5 },
      { result: {}, selector: () => undefined },
    ]);

    expect(prices.map(price => price.toNumber())).toEqual([150]);
  });

  it('skips vendors without a response', () => {
    const prices = pullPriceDataFromAvailableResponses([
      { result: undefined, selector: () => 1.5 },
    ]);

    expect(prices).toEqual([]);
  });
});
