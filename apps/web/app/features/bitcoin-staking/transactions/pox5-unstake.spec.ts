import { ClarityType, deserializeCV } from '@stacks/transactions';

import { getUnstakeOptions } from './pox5-unstake';

const pox5ContractId = 'SP000000000000000000002Q6VF78.pox-5';
const currentSignerManagerContractId = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.signer-manager';

describe(getUnstakeOptions.name, () => {
  test('builds an unstake call carrying only the current signer manager', () => {
    const options = getUnstakeOptions({
      currentSignerManagerContractId,
      pox5ContractId,
      network: 'mainnet',
    });

    expect(options.contract).toEqual(pox5ContractId);
    expect(options.functionName).toEqual('unstake');
    expect(options.functionArgs).toHaveLength(1);

    const [signerManager] = (options.functionArgs ?? []).map(arg => deserializeCV(arg));
    expect(signerManager).toEqual({
      type: ClarityType.PrincipalContract,
      value: currentSignerManagerContractId,
    });
  });
});
