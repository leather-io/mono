import { ChainId, STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';

import { getStacksNetworkFromChainId } from '@app/store/networks/networks.hooks';

describe(getStacksNetworkFromChainId.name, () => {
  test('that it returns the mainnet network for the mainnet chain id', () => {
    expect(getStacksNetworkFromChainId(ChainId.Mainnet)).toEqual(STACKS_MAINNET);
  });

  test('that it returns the testnet network for the testnet chain id', () => {
    expect(getStacksNetworkFromChainId(ChainId.Testnet)).toEqual(STACKS_TESTNET);
  });

  test('that it returns the testnet network for an unknown custom chain id instead of throwing', () => {
    expect(() => getStacksNetworkFromChainId(256)).not.toThrow();
    expect(getStacksNetworkFromChainId(256)).toEqual(STACKS_TESTNET);
  });
});
