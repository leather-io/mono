import BigNumber from 'bignumber.js';

import { createMoney } from '@leather.io/utils';

import { isBtcBalanceSufficient, isBtcMinimumSpend } from './amount-validation';

describe('isBtcBalanceSufficient', () => {
  it('returns true if the balance is sufficient', () => {
    const args = {
      desiredSpend: createMoney(1, 'BTC'),
      maxSpend: createMoney(2, 'BTC'),
    };
    expect(isBtcBalanceSufficient(args)).toBe(true);
  });

  it('returns false if the balance is not sufficient', () => {
    const args = {
      desiredSpend: createMoney(2, 'BTC'),
      maxSpend: createMoney(1, 'BTC'),
    };
    expect(isBtcBalanceSufficient(args)).toBe(false);
  });
});

describe('isBtcMinimumSpend', () => {
  it('returns true if the amount is greater than or equal to the minimum spend', () => {
    const desiredSpend = { amount: new BigNumber(600), decimals: 8, symbol: 'BTC' };
    expect(isBtcMinimumSpend(desiredSpend)).toBe(true);
  });

  it('returns true if the amount is equal to the minimum spend', () => {
    const desiredSpend = { amount: new BigNumber(546), decimals: 8, symbol: 'BTC' };
    expect(isBtcMinimumSpend(desiredSpend)).toBe(true);
  });
  it('returns false if the amount is less than the minimum spend', () => {
    const desiredSpend = { amount: new BigNumber(1), decimals: 8, symbol: 'BTC' };
    expect(isBtcMinimumSpend(desiredSpend)).toBe(false);
  });
  it('returns false if the amount is less than the minimum spend', () => {
    const desiredSpend = { amount: new BigNumber(545), decimals: 8, symbol: 'BTC' };
    expect(isBtcMinimumSpend(desiredSpend)).toBe(false);
  });
});
