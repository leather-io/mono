import { Pox5StakerInfo } from '../queries/create-get-pox5-staker-info-query-options';
import { getPox5TransitionPhase } from './pox5-transition';

const cycleParams = {
  rewardCycleLength: 2100,
  firstBurnchainBlockHeight: 0,
};

const stakerInfo: Pox5StakerInfo = {
  amountMicroStx: 100_000_000n,
  firstRewardCycle: 101,
  numCycles: 12,
  signerManagerContractId: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.signer-manager',
};

const activationBurnHeight = 100 * 2100;

const baseArgs = {
  ...cycleParams,
  currentBurnHeight: activationBurnHeight,
  pox4Stacked: false,
  lockedMicroStx: 0n,
  pox5StakerInfo: null,
};

describe(getPox5TransitionPhase.name, () => {
  test('returns pox4-only when no activation is configured', () => {
    expect(
      getPox5TransitionPhase({ ...baseArgs, pox5Status: { status: 'not-configured' } })
    ).toEqual('pox4-only');
  });

  test('returns pre-activation before the activation height', () => {
    expect(
      getPox5TransitionPhase({
        ...baseArgs,
        pox5Status: { status: 'pre-activation', activationBurnHeight },
      })
    ).toEqual('pre-activation');
  });

  test('returns activation-cycle while still inside the activation cycle', () => {
    expect(
      getPox5TransitionPhase({
        ...baseArgs,
        pox5Status: { status: 'active', activationBurnHeight },
        currentBurnHeight: activationBurnHeight + 2099,
        pox4Stacked: true,
      })
    ).toEqual('activation-cycle');
  });

  test('returns needs-restake when pox-4 funds unlocked and no pox-5 position exists', () => {
    expect(
      getPox5TransitionPhase({
        ...baseArgs,
        pox5Status: { status: 'active', activationBurnHeight },
        currentBurnHeight: activationBurnHeight + 2100,
        pox4Stacked: true,
      })
    ).toEqual('needs-restake');
  });

  test('returns pox5-steady-state once a pox-5 position exists', () => {
    expect(
      getPox5TransitionPhase({
        ...baseArgs,
        pox5Status: { status: 'active', activationBurnHeight },
        currentBurnHeight: activationBurnHeight + 2100,
        pox5StakerInfo: stakerInfo,
      })
    ).toEqual('pox5-steady-state');
  });

  test('returns pox5-steady-state for users with no prior stake', () => {
    expect(
      getPox5TransitionPhase({
        ...baseArgs,
        pox5Status: { status: 'active', activationBurnHeight },
        currentBurnHeight: activationBurnHeight + 2100,
      })
    ).toEqual('pox5-steady-state');
  });
});
