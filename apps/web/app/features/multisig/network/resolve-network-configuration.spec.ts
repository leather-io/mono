import { afterEach, describe, expect, test, vi } from 'vitest';
import type { CustomNetworkConfig } from '~/constants/custom-network-config';

import { defaultNetworksKeyedById } from '@leather.io/models';

import { resolveNetworkConfiguration } from './resolve-network-configuration';

const mocks = vi.hoisted(() => ({ customNetworkConfig: null as CustomNetworkConfig | null }));

vi.mock('~/constants/custom-network-config', () => ({
  get customNetworkConfig() {
    return mocks.customNetworkConfig;
  },
}));

const privateNetwork: CustomNetworkConfig = {
  bitcoinNetworkMode: 'regtest',
  name: 'BTC Staking Testnet',
  key: 'private-1',
  bitcoinApiUrl: 'https://mempool.bitcoin.private-1.hiro.so/api',
  stacksApiUrl: 'https://api.private-1.hiro.so',
  stacksChainId: 256,
};

afterEach(() => {
  mocks.customNetworkConfig = null;
});

describe('resolveNetworkConfiguration', () => {
  test('returns the default network when no custom network is configured', () => {
    expect(resolveNetworkConfiguration('testnet')).toBe(defaultNetworksKeyedById.testnet);
    expect(resolveNetworkConfiguration('mainnet')).toBe(defaultNetworksKeyedById.mainnet);
  });

  test('substitutes the custom network for testnet when one is configured', () => {
    mocks.customNetworkConfig = privateNetwork;
    const network = resolveNetworkConfiguration('testnet');
    expect(network.id).toBe('private-1');
    expect(network.chain.bitcoin.bitcoinUrl).toBe('https://mempool.bitcoin.private-1.hiro.so/api');
    expect(network.chain.stacks.url).toBe('https://api.private-1.hiro.so');
  });

  test('reports a regtest bitcoin network rather than testnet3', () => {
    mocks.customNetworkConfig = privateNetwork;
    expect(resolveNetworkConfiguration('testnet').chain.bitcoin.bitcoinNetwork).toBe('regtest');
  });

  test('leaves mainnet untouched when a custom network is configured', () => {
    mocks.customNetworkConfig = privateNetwork;
    expect(resolveNetworkConfiguration('mainnet')).toBe(defaultNetworksKeyedById.mainnet);
  });
});
