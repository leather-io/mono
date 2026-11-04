import BigNumber from 'bignumber.js';

import { calculateStxToMove, getNftDisplayName } from './move-to-fresh-account.utils';

describe(calculateStxToMove.name, () => {
  it('subtracts every transaction fee from the available balance', () => {
    const result = calculateStxToMove({
      availableBalance: new BigNumber(1_000_000),
      fees: [new BigNumber(3_000), new BigNumber(5_000), new BigNumber(2_000)],
    });
    expect(result.toString()).toBe('990000');
  });

  it('returns a value that is not positive when fees use the full balance', () => {
    const result = calculateStxToMove({
      availableBalance: new BigNumber(4_000),
      fees: [new BigNumber(3_000), new BigNumber(2_000)],
    });
    expect(result.isGreaterThan(0)).toBe(false);
  });
});

describe(getNftDisplayName.name, () => {
  it('uses the asset name and the token id without the uint prefix', () => {
    expect(
      getNftDisplayName('SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2::BNS-V2', 'u42')
    ).toBe('BNS-V2 #42');
  });
});
