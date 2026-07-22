import { ClarityType, deserializeCV } from '@stacks/transactions';

import { getStakeUpdateOptions } from './pox5-stake-update';

const pox5ContractId = 'SP000000000000000000002Q6VF78.pox-5';
const currentSignerManagerContractId = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.signer-manager';
const newSignerManagerContractId = 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW.other-signer-manager';

const baseArgs = {
  newSignerManagerContractId,
  currentSignerManagerContractId,
  cyclesToExtend: 6,
  amountIncreaseMicroStx: 10_000_000n,
  pox5ContractId,
  network: 'mainnet',
} as const;

describe(getStakeUpdateOptions.name, () => {
  test('builds a stake-update call with new and old signer managers in order', () => {
    const options = getStakeUpdateOptions(baseArgs);

    expect(options.contract).toEqual(pox5ContractId);
    expect(options.functionName).toEqual('stake-update');

    const [newSignerManager, oldSignerManager, cyclesToExtend, amountIncrease, calldata] = (
      options.functionArgs ?? []
    ).map(arg => deserializeCV(arg));

    expect(newSignerManager).toEqual({
      type: ClarityType.PrincipalContract,
      value: newSignerManagerContractId,
    });
    expect(oldSignerManager).toEqual({
      type: ClarityType.PrincipalContract,
      value: currentSignerManagerContractId,
    });
    expect(cyclesToExtend).toEqual({ type: ClarityType.UInt, value: 6n });
    expect(amountIncrease).toEqual({ type: ClarityType.UInt, value: 10_000_000n });
    expect(calldata.type).toEqual(ClarityType.OptionalNone);
  });

  test('allows zero extend and zero increase', () => {
    expect(() =>
      getStakeUpdateOptions({ ...baseArgs, cyclesToExtend: 0, amountIncreaseMicroStx: 0n })
    ).not.toThrowError();
  });

  test('throws on negative or out-of-range values', () => {
    expect(() => getStakeUpdateOptions({ ...baseArgs, cyclesToExtend: -1 })).toThrowError();
    expect(() => getStakeUpdateOptions({ ...baseArgs, cyclesToExtend: 97 })).toThrowError();
    expect(() =>
      getStakeUpdateOptions({ ...baseArgs, amountIncreaseMicroStx: -1n })
    ).toThrowError();
  });
});
