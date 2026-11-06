import BigNumber from 'bignumber.js';

import { calculateRotationAmount } from './send-and-rotate.utils';

describe(calculateRotationAmount.name, () => {
  test('subtracts the amount and a fee for each of the two transfers', () => {
    expect(
      calculateRotationAmount({
        availableBalance: new BigNumber(1_000_000),
        amount: new BigNumber(400_000),
        feePerTransfer: new BigNumber(3_000),
      })
    ).toEqual(new BigNumber(594_000));
  });

  test('is not positive when nothing is left after the send and both fees', () => {
    expect(
      calculateRotationAmount({
        availableBalance: new BigNumber(10_000),
        amount: new BigNumber(4_000),
        feePerTransfer: new BigNumber(3_000),
      }).isGreaterThan(0)
    ).toBe(false);
  });
});
