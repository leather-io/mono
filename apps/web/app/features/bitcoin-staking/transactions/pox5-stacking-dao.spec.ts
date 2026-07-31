import { ClarityType, deserializeCV } from '@stacks/transactions';

import { getClaimStakerRewardsOptions } from './pox5-claim-rewards';
import {
  getStackingDaoClaimStakerRewardsOptions,
  getStackingDaoStakeOptions,
  getStackingDaoStakeUpdateOptions,
  getStackingDaoUnstakeOptions,
  getStackingDaoWrapperContract,
  isStackingDaoSignerManager,
  isStackingDaoWrapperContract,
} from './pox5-stacking-dao';
import { getStakeOptions } from './pox5-stake';
import { getStakeUpdateOptions } from './pox5-stake-update';
import { getUnstakeOptions } from './pox5-unstake';

const pox5ContractId = 'SP000000000000000000002Q6VF78.pox-5';
const stackingDaoSignerManagerContractId =
  'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-pool-signer-manager';
const stackingDaoWrapperContractId = 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-pool-v1';

const stakeArgs = {
  signerManagerContractId: stackingDaoSignerManagerContractId,
  amountMicroStx: 40_000_000n,
  numCycles: 12,
  startBurnHeight: 900_000,
  pox5ContractId,
  network: 'mainnet',
} as const;

const stakeUpdateArgs = {
  newSignerManagerContractId: stackingDaoSignerManagerContractId,
  currentSignerManagerContractId: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.signer-manager',
  cyclesToExtend: 6,
  amountIncreaseMicroStx: 10_000_000n,
  currentAmountMicroStx: 100_000_000n,
  pox5ContractId,
  network: 'mainnet',
} as const;

describe(getStackingDaoWrapperContract.name, () => {
  test('maps the Stacking DAO signer-manager to their native-pool wrapper', () => {
    expect(getStackingDaoWrapperContract(stackingDaoSignerManagerContractId)).toEqual(
      stackingDaoWrapperContractId
    );
  });

  test('is undefined for any other signer-manager', () => {
    expect(
      getStackingDaoWrapperContract(
        'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP.fastpool-1-signer-manager'
      )
    ).toBeUndefined();
  });
});

describe(isStackingDaoSignerManager.name, () => {
  test('recognises only the Stacking DAO signer-manager', () => {
    expect(isStackingDaoSignerManager(stackingDaoSignerManagerContractId)).toBe(true);
    expect(isStackingDaoSignerManager(stackingDaoWrapperContractId)).toBe(false);
  });
});

describe(isStackingDaoWrapperContract.name, () => {
  test('recognises only the Stacking DAO wrapper contract', () => {
    expect(isStackingDaoWrapperContract(stackingDaoWrapperContractId)).toBe(true);
    expect(isStackingDaoWrapperContract(stackingDaoSignerManagerContractId)).toBe(false);
  });
});

describe(getStackingDaoStakeOptions.name, () => {
  test('builds a delegate call against the wrapper contract', () => {
    const options = getStackingDaoStakeOptions(stakeArgs);

    expect(options.contract).toEqual(stackingDaoWrapperContractId);
    expect(options.functionName).toEqual('delegate');

    const args = (options.functionArgs ?? []).map(arg => deserializeCV(arg));
    expect(args).toHaveLength(3);

    const [signerManager, amount, numCycles] = args;
    expect(signerManager).toEqual({
      type: ClarityType.PrincipalContract,
      value: stackingDaoSignerManagerContractId,
    });
    expect(amount).toEqual({ type: ClarityType.UInt, value: 40_000_000n });
    expect(numCycles).toEqual({ type: ClarityType.UInt, value: 12n });
  });

  test('keeps the standard staking post-condition', () => {
    const direct = getStakeOptions(stakeArgs);
    const stackingDao = getStackingDaoStakeOptions(stakeArgs);

    expect(stackingDao.postConditions).toEqual(direct.postConditions);
    expect(stackingDao.postConditionMode).toEqual('deny');
  });

  test('throws when a payout preference is set', () => {
    const payoutPreference = {
      btcRewardAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      maxFeeSats: 2500n,
    };
    expect(() => getStackingDaoStakeOptions({ ...stakeArgs, payoutPreference })).toThrowError();
  });

  test('throws for a signer-manager without a wrapper', () => {
    expect(() =>
      getStackingDaoStakeOptions({
        ...stakeArgs,
        signerManagerContractId: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.signer-manager',
      })
    ).toThrowError();
  });
});

describe(getStackingDaoStakeUpdateOptions.name, () => {
  test('builds a delegate-update call keeping the standard args and post-conditions', () => {
    const direct = getStakeUpdateOptions(stakeUpdateArgs);
    const stackingDao = getStackingDaoStakeUpdateOptions(stakeUpdateArgs);

    expect(stackingDao.contract).toEqual(stackingDaoWrapperContractId);
    expect(stackingDao.functionName).toEqual('delegate-update');
    expect(stackingDao.functionArgs).toEqual(direct.functionArgs);
    expect(stackingDao.postConditions).toEqual(direct.postConditions);
    expect(stackingDao.postConditionMode).toEqual('deny');
  });
});

describe(getStackingDaoUnstakeOptions.name, () => {
  test('builds an undelegate call keeping the standard args and post-conditions', () => {
    const unstakeArgs = {
      currentSignerManagerContractId: stackingDaoSignerManagerContractId,
      pox5ContractId,
      network: 'mainnet',
    };
    const direct = getUnstakeOptions(unstakeArgs);
    const stackingDao = getStackingDaoUnstakeOptions(unstakeArgs);

    expect(stackingDao.contract).toEqual(stackingDaoWrapperContractId);
    expect(stackingDao.functionName).toEqual('undelegate');
    expect(stackingDao.functionArgs).toEqual(direct.functionArgs);
    expect(stackingDao.postConditions).toEqual(direct.postConditions);
  });
});

describe(getStackingDaoClaimStakerRewardsOptions.name, () => {
  test('claims directly from the signer-manager without a staker principal', () => {
    const claimArgs = {
      signerManagerContractId: stackingDaoSignerManagerContractId,
      stakerAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      rewardCycle: 101,
      network: 'mainnet',
    };
    const direct = getClaimStakerRewardsOptions(claimArgs);
    const stackingDao = getStackingDaoClaimStakerRewardsOptions(claimArgs);

    expect(stackingDao.contract).toEqual(stackingDaoSignerManagerContractId);
    expect(stackingDao.functionName).toEqual('claim-staker-rewards');
    expect(stackingDao.postConditionMode).toEqual(direct.postConditionMode);

    const args = (stackingDao.functionArgs ?? []).map(arg => deserializeCV(arg));
    expect(args).toHaveLength(2);

    const [rewardCycle, bondIndex] = args;
    expect(rewardCycle).toEqual({ type: ClarityType.UInt, value: 101n });
    expect(bondIndex.type).toEqual(ClarityType.OptionalNone);
  });
});
