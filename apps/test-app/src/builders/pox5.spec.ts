// The post conditions and the post-condition MODE are what the staking tests
// exist to exercise, so they are pinned here: a silent change to either would
// otherwise make the catalog test something other than production.
import { describe, expect, test } from 'vitest';

import { decodePostCondition } from '../verifiers/stx-decode';
import {
  getClaimStakerRewardsOptions,
  getStakeOptions,
  getStakeUpdateOptions,
  getUnstakeOptions,
  parseContractId,
} from './pox5';

const pox5ContractId = 'SP000000000000000000002Q6VF78.pox-5';
const signerManagerContractId = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.signer-manager';
const stakerAddress = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';

const stakeArgs = {
  signerManagerContractId,
  amountMicroStx: 40_000_000n,
  numCycles: 12,
  startBurnHeight: 900_000,
  pox5ContractId,
  network: 'mainnet',
};

describe('parseContractId', () => {
  test('splits a contract id', () => {
    expect(parseContractId(signerManagerContractId)).toEqual({
      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'signer-manager',
    });
  });

  test('rejects anything that is not address.name', () => {
    expect(() => parseContractId('not-a-contract')).toThrow('Invalid contract id');
  });
});

describe('getStakeOptions', () => {
  test('calls stake on the pox-5 contract with five arguments', () => {
    const options = getStakeOptions(stakeArgs);
    expect(options.contract).toBe(pox5ContractId);
    expect(options.functionName).toBe('stake');
    expect(options.functionArgs).toHaveLength(5);
  });

  test('sends deny mode with a staking post-condition equal to the amount', () => {
    const options = getStakeOptions(stakeArgs);
    expect(options.postConditionMode).toBe('deny');
    expect(options.postConditions).toHaveLength(1);
    const decoded = decodePostCondition(options.postConditions![0]);
    expect(decoded).toMatchObject({ type: 'staking-postcondition', condition: 'eq' });
  });

  test('rejects a cycle count outside the protocol range', () => {
    expect(() => getStakeOptions({ ...stakeArgs, numCycles: 0 })).toThrow();
    expect(() => getStakeOptions({ ...stakeArgs, numCycles: 97 })).toThrow();
  });
});

describe('getStakeUpdateOptions', () => {
  const updateArgs = {
    newSignerManagerContractId: signerManagerContractId,
    currentSignerManagerContractId: signerManagerContractId,
    cyclesToExtend: 0,
    amountIncreaseMicroStx: 0n,
    currentAmountMicroStx: 40_000_000n,
    pox5ContractId,
    network: 'mainnet',
  };

  test('an amount increase pins the RESULTING TOTAL with eq', () => {
    const options = getStakeUpdateOptions({ ...updateArgs, amountIncreaseMicroStx: 10_000_000n });
    const decoded = decodePostCondition(options.postConditions![0]);
    expect(decoded).toMatchObject({ type: 'staking-postcondition', condition: 'eq' });
    // 40 STX already staked + 10 STX added = 50 STX total.
    expect(String((decoded as { amount: unknown }).amount)).toBe('50000000');
  });

  test('a cycles-only extend caps the total with lte, because node builds disagree', () => {
    const options = getStakeUpdateOptions({ ...updateArgs, cyclesToExtend: 6 });
    const decoded = decodePostCondition(options.postConditions![0]);
    expect(decoded).toMatchObject({ condition: 'lte' });
    expect(String((decoded as { amount: unknown }).amount)).toBe('40000000');
  });
});

describe('getUnstakeOptions', () => {
  test('sends a pox post-condition of will-perform under deny mode', () => {
    const options = getUnstakeOptions({
      currentSignerManagerContractId: signerManagerContractId,
      pox5ContractId,
      network: 'mainnet',
    });
    expect(options.functionName).toBe('unstake');
    expect(options.postConditionMode).toBe('deny');
    expect(decodePostCondition(options.postConditions![0])).toMatchObject({
      type: 'pox-postcondition',
      condition: 'will-perform',
    });
  });
});

describe('getClaimStakerRewardsOptions', () => {
  test('targets the signer-manager in originator mode with no post conditions', () => {
    const options = getClaimStakerRewardsOptions({
      signerManagerContractId,
      stakerAddress,
      rewardCycle: 3,
      network: 'mainnet',
    });
    expect(options.contract).toBe(signerManagerContractId);
    expect(options.functionName).toBe('claim-staker-rewards');
    expect(options.postConditionMode).toBe('originator');
    expect(options.postConditions).toBeUndefined();
  });

  test('rejects a negative reward cycle', () => {
    expect(() =>
      getClaimStakerRewardsOptions({
        signerManagerContractId,
        stakerAddress,
        rewardCycle: -1,
        network: 'mainnet',
      })
    ).toThrow();
  });
});
