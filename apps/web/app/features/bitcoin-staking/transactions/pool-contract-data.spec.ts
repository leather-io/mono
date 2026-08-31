import { buildPoolContractData, getPoolContractData } from './pool-contract-data';

const pox5ContractId = 'SP000000000000000000002Q6VF78.pox-5';
const signerManagerContractId = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.signer-manager';
const stackingDaoSignerManagerContractId =
  'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.native-pool-signer-manager';

function stakeArgs(managerContractId: string) {
  return {
    signerManagerContractId: managerContractId,
    amountMicroStx: 40_000_000n,
    numCycles: 12,
    startBurnHeight: 900_000,
    pox5ContractId,
    network: 'mainnet',
  };
}

describe(buildPoolContractData.name, () => {
  test('defaults every call to the direct pox-5 builders', () => {
    const pool = buildPoolContractData();

    expect(pool.stake(stakeArgs(signerManagerContractId)).functionName).toEqual('stake');
    expect(
      pool.unstake({
        currentSignerManagerContractId: signerManagerContractId,
        pox5ContractId,
        network: 'mainnet',
      }).functionName
    ).toEqual('unstake');
  });

  test('applies per-call overrides over the defaults', () => {
    const pool = buildPoolContractData({
      stake: () => ({ contract: 'SP000000000000000000002Q6VF78.other', functionName: 'other' }),
    });

    expect(pool.stake(stakeArgs(signerManagerContractId)).functionName).toEqual('other');
    expect(
      pool.unstake({
        currentSignerManagerContractId: signerManagerContractId,
        pox5ContractId,
        network: 'mainnet',
      }).functionName
    ).toEqual('unstake');
  });
});

describe(getPoolContractData.name, () => {
  test('resolves standard pools to direct pox-5 calls', () => {
    const options = getPoolContractData(signerManagerContractId).stake(
      stakeArgs(signerManagerContractId)
    );

    expect(options.contract).toEqual(pox5ContractId);
    expect(options.functionName).toEqual('stake');
  });

  test('routes a switch into Stacking DAO through their wrapper', () => {
    const options = getPoolContractData(stackingDaoSignerManagerContractId).stakeUpdate({
      newSignerManagerContractId: stackingDaoSignerManagerContractId,
      currentSignerManagerContractId: signerManagerContractId,
      cyclesToExtend: 0,
      amountIncreaseMicroStx: 0n,
      currentAmountMicroStx: 40_000_000n,
      pox5ContractId,
      network: 'mainnet',
    });

    expect(options.functionName).toEqual('delegate-update');
  });

  test('routes a switch out of Stacking DAO as a direct pox-5 stake-update', () => {
    const options = getPoolContractData(signerManagerContractId).stakeUpdate({
      newSignerManagerContractId: signerManagerContractId,
      currentSignerManagerContractId: stackingDaoSignerManagerContractId,
      cyclesToExtend: 0,
      amountIncreaseMicroStx: 0n,
      currentAmountMicroStx: 40_000_000n,
      pox5ContractId,
      network: 'mainnet',
    });

    expect(options.contract).toEqual(pox5ContractId);
    expect(options.functionName).toEqual('stake-update');
  });

  test('resolves the Stacking DAO signer-manager to their wrapper calls', () => {
    const pool = getPoolContractData(stackingDaoSignerManagerContractId);

    expect(pool.stake(stakeArgs(stackingDaoSignerManagerContractId)).functionName).toEqual(
      'delegate'
    );
    expect(
      pool.unstake({
        currentSignerManagerContractId: stackingDaoSignerManagerContractId,
        pox5ContractId,
        network: 'mainnet',
      }).functionName
    ).toEqual('undelegate');
    expect(
      pool.claimStakerRewards({
        signerManagerContractId: stackingDaoSignerManagerContractId,
        stakerAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        rewardCycle: 101,
        network: 'mainnet',
      }).functionArgs
    ).toHaveLength(2);
  });
});
