import { ClarityType, deserializeCV } from '@stacks/transactions';

import { decodePayoutPreference } from './pox5-signer-calldata';
import { getStakeOptions } from './pox5-stake';

const pox5ContractId = 'SP000000000000000000002Q6VF78.pox-5';
const signerManagerContractId = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.signer-manager';

const baseArgs = {
  signerManagerContractId,
  amountMicroStx: 40_000_000n,
  numCycles: 12,
  startBurnHeight: 900_000,
  pox5ContractId,
  network: 'mainnet',
} as const;

describe(getStakeOptions.name, () => {
  test('builds a stake call against the pox-5 contract', () => {
    const options = getStakeOptions(baseArgs);

    expect(options.contract).toEqual(pox5ContractId);
    expect(options.functionName).toEqual('stake');
    expect(options.network).toEqual('mainnet');

    const [signerManager, amount, numCycles, startBurnHeight, calldata] = (
      options.functionArgs ?? []
    ).map(arg => deserializeCV(arg));

    expect(signerManager).toEqual({
      type: ClarityType.PrincipalContract,
      value: signerManagerContractId,
    });
    expect(amount).toEqual({ type: ClarityType.UInt, value: 40_000_000n });
    expect(numCycles).toEqual({ type: ClarityType.UInt, value: 12n });
    expect(startBurnHeight).toEqual({ type: ClarityType.UInt, value: 900_000n });
    expect(calldata.type).toEqual(ClarityType.OptionalNone);
  });

  test('encodes the payout preference into signer calldata', () => {
    const payoutPreference = {
      btcRewardAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      maxFeeSats: 2500n,
    };
    const options = getStakeOptions({ ...baseArgs, payoutPreference });

    const args = (options.functionArgs ?? []).map(arg => deserializeCV(arg));
    const calldata = args[4];
    expect(decodePayoutPreference(calldata, 'mainnet')).toEqual(payoutPreference);
  });

  test('throws on out-of-range cycle counts', () => {
    expect(() => getStakeOptions({ ...baseArgs, numCycles: 0 })).toThrowError();
    expect(() => getStakeOptions({ ...baseArgs, numCycles: 97 })).toThrowError();
    expect(() => getStakeOptions({ ...baseArgs, numCycles: 1.5 })).toThrowError();
  });

  test('throws on a malformed signer-manager contract id', () => {
    expect(() =>
      getStakeOptions({ ...baseArgs, signerManagerContractId: 'not-a-contract-id' })
    ).toThrowError();
  });
});
