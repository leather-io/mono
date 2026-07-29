import { Pox5StakerInfo } from '../queries/create-get-pox5-staker-info-query-options';
import { getPox5NeedsRestake } from './pox5-transition';

const stakerInfo: Pox5StakerInfo = {
  amountMicroStx: 100_000_000n,
  firstRewardCycle: 101,
  numCycles: 12,
  signerManagerContractId: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.signer-manager',
};

const baseArgs = {
  pox4Stacked: false,
  lockedMicroStx: 0n,
  pox5StakerInfo: null,
};

describe(getPox5NeedsRestake.name, () => {
  test('is true when pox-4 funds are still stacked and no pox-5 position exists', () => {
    expect(getPox5NeedsRestake({ ...baseArgs, pox4Stacked: true })).toBe(true);
  });

  test('is true when STX is still locked and no pox-5 position exists', () => {
    expect(getPox5NeedsRestake({ ...baseArgs, lockedMicroStx: 100_000_000n })).toBe(true);
  });

  test('is false once a pox-5 position exists', () => {
    expect(
      getPox5NeedsRestake({ ...baseArgs, pox4Stacked: true, pox5StakerInfo: stakerInfo })
    ).toBe(false);
  });

  test('is false for users with no prior stake', () => {
    expect(getPox5NeedsRestake(baseArgs)).toBe(false);
  });
});
