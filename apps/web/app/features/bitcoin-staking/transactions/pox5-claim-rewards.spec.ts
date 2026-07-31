import { ClarityType, deserializeCV } from '@stacks/transactions';

import { getClaimStakerRewardsOptions } from './pox5-claim-rewards';

const signerManagerContractId = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.signer-manager';
const stakerAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

describe(getClaimStakerRewardsOptions.name, () => {
  test('builds a per-cycle claim against the signer-manager contract', () => {
    const options = getClaimStakerRewardsOptions({
      signerManagerContractId,
      stakerAddress,
      rewardCycle: 101,
      network: 'testnet',
    });

    expect(options.contract).toEqual(signerManagerContractId);
    expect(options.functionName).toEqual('claim-staker-rewards');

    const [staker, rewardCycle, bondIndex] = (options.functionArgs ?? []).map(arg =>
      deserializeCV(arg)
    );
    expect(staker).toEqual({ type: ClarityType.PrincipalStandard, value: stakerAddress });
    expect(rewardCycle).toEqual({ type: ClarityType.UInt, value: 101n });
    expect(bondIndex.type).toEqual(ClarityType.OptionalNone);
  });

  test('throws on a negative reward cycle', () => {
    expect(() =>
      getClaimStakerRewardsOptions({
        signerManagerContractId,
        stakerAddress,
        rewardCycle: -1,
        network: 'testnet',
      })
    ).toThrowError();
  });
});
