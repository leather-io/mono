import type { CustomNetworkConfig } from '~/constants/custom-network';

import { ChainId } from '@leather.io/models';

import { buildCustomNetworkConfiguration } from './custom-network-config';

const regtestConfig: CustomNetworkConfig = {
  flavor: 'regtest',
  name: 'Private',
  key: 'private',
  bitcoinApiUrl: 'https://mempool.bitcoin.private-1.hiro.so/api',
  stacksApiUrl: 'https://api.private-1.hiro.so',
  stacksChainId: 2147483648,
};

describe('buildCustomNetworkConfiguration', () => {
  test('uses the custom key as the network id so the mempool client targets bitcoinUrl', () => {
    expect(buildCustomNetworkConfiguration(regtestConfig).id).toBe('private');
  });

  test('maps a regtest flavor to regtest bitcoin mode + custom urls', () => {
    const config = buildCustomNetworkConfiguration(regtestConfig);
    expect(config.chain.bitcoin.mode).toBe('regtest');
    expect(config.chain.bitcoin.bitcoinNetwork).toBe('regtest');
    expect(config.chain.bitcoin.bitcoinUrl).toBe('https://mempool.bitcoin.private-1.hiro.so/api');
    expect(config.chain.stacks.url).toBe('https://api.private-1.hiro.so');
    expect(config.chain.stacks.chainId).toBe(2147483648);
  });

  test('maps a testnet flavor to testnet bitcoin mode', () => {
    const config = buildCustomNetworkConfiguration({ ...regtestConfig, flavor: 'testnet' });
    expect(config.chain.bitcoin.mode).toBe('testnet');
    expect(config.chain.bitcoin.bitcoinNetwork).toBe('testnet3');
  });

  test('falls back to the testnet chain-id when none is provided', () => {
    const config = buildCustomNetworkConfiguration({ ...regtestConfig, stacksChainId: undefined });
    expect(config.chain.stacks.chainId).toBe(ChainId.Testnet);
  });
});
