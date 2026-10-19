import { afterEach, describe, expect, test, vi } from 'vitest';
import type { CustomNetworkConfig } from '~/constants/custom-network-config';

import { resolveWalletRpcNetwork } from './resolve-wallet-rpc-network';

interface Mocks {
  customNetworkConfig: CustomNetworkConfig | null;
}

const mocks = vi.hoisted((): Mocks => ({ customNetworkConfig: null }));

vi.mock('~/constants/custom-network-config', () => ({
  get customNetworkConfig() {
    return mocks.customNetworkConfig;
  },
}));

afterEach(() => {
  mocks.customNetworkConfig = null;
});

describe('resolveWalletRpcNetwork', () => {
  test('returns mainnet for mainnet networks', () => {
    expect(resolveWalletRpcNetwork('btc:mainnet')).toBe('mainnet');
    expect(resolveWalletRpcNetwork('stx:mainnet')).toBe('mainnet');
  });

  test('keeps bitcoin testnet vaults on testnet3', () => {
    expect(resolveWalletRpcNetwork('btc:testnet')).toBe('testnet3');
  });

  test('keeps stacks testnet requests on testnet', () => {
    expect(resolveWalletRpcNetwork('stx:testnet')).toBe('testnet');
  });

  test('returns the custom network key when one is configured', () => {
    mocks.customNetworkConfig = {
      bitcoinNetworkMode: 'testnet',
      name: 'BTC Staking Testnet',
      key: 'stakingTestnet',
      bitcoinApiUrl: 'https://mempool.bitcoin.staking-testnet.hiro.so/api',
      stacksApiUrl: 'https://api.staking-testnet.hiro.so',
      stacksChainId: 1280,
    };
    expect(resolveWalletRpcNetwork('btc:testnet')).toBe('stakingTestnet');
    expect(resolveWalletRpcNetwork('stx:testnet')).toBe('stakingTestnet');
  });
});
