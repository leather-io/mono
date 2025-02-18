import BigNumber from 'bignumber.js';

import { isBtcBalanceSufficient, isBtcMinimumSpend } from './amount-validation';

describe('isBtcBalanceSufficient', () => {
  it('returns true if the balance is sufficient', () => {
    const args = {
      amount: 1,
      spendableBtc: new BigNumber(2),
    };
    expect(isBtcBalanceSufficient(args)).toBe(true);
  });

  it('returns false if the balance is not sufficient', () => {
    const args = {
      amount: 2,
      spendableBtc: new BigNumber(1),
    };
    expect(isBtcBalanceSufficient(args)).toBe(false);
  });
});

describe('isBtcMinimumSpend', () => {
  it('returns true if the amount is greater than or equal to the minimum spend', () => {
    const args = {
      amount: 1,
    };
    expect(isBtcMinimumSpend(args)).toBe(true);
  });

  it('returns false if the amount is less than the minimum spend', () => {
    const args = {
      amount: 0.000005,
    };
    expect(isBtcMinimumSpend(args)).toBe(false);
  });
});
