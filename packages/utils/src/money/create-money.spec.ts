import BigNumber from 'bignumber.js';

import { createMoney, createMoneyFromDecimal } from './create-money';

describe(createMoney.name, () => {
  test('returns Money object for a known currency', () => {
    const result = createMoney(100, 'USD');
    expect(result).toEqual({
      amount: new BigNumber(100),
      symbol: 'USD',
      decimals: 2,
    });
  });

  test('returns Money object for an unknown currency when resolution is provided', () => {
    const result = createMoney(1, 'XYZ', 3);
    expect(result).toEqual({
      amount: new BigNumber(1),
      symbol: 'XYZ',
      decimals: 3,
    });
  });
});

describe(createMoneyFromDecimal.name, () => {
  test('converts decimal amount to fractional unit for a known currency', () => {
    const result = createMoneyFromDecimal(1, 'USD');
    expect(result).toEqual({
      amount: new BigNumber(100),
      symbol: 'USD',
      decimals: 2,
    });
  });

  test('converts decimal amount when resolution provided for an unknown currency', () => {
    const result = createMoneyFromDecimal(1, 'XYZ', 3);
    expect(result).toEqual({
      amount: new BigNumber(1000),
      symbol: 'XYZ',
      decimals: 3,
    });
  });
});
