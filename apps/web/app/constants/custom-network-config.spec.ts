import { afterEach, describe, expect, test, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function loadCustomNetworkConfig() {
  vi.resetModules();
  return import('./custom-network-config');
}

function stubUrls() {
  vi.stubEnv('LEATHER_BITCOIN_API_URL', 'https://mempool.bitcoin.private-1.hiro.so/api');
  vi.stubEnv('LEATHER_STACKS_API_URL', 'https://api.private-1.hiro.so');
}

describe('customNetworkConfig', () => {
  test('is null when no private-network env vars are set', async () => {
    const { customNetworkConfig } = await loadCustomNetworkConfig();
    expect(customNetworkConfig).toBeNull();
  });

  test('resolves when bitcoin network mode + both api urls are set', async () => {
    vi.stubEnv('LEATHER_PRIVATE_NETWORK_FLAVOR', 'regtest');
    vi.stubEnv('LEATHER_PRIVATE_NETWORK_NAME', 'Private');
    vi.stubEnv('LEATHER_PRIVATE_NETWORK_KEY', 'private');
    vi.stubEnv('LEATHER_STACKS_CHAIN_ID', '2147483648');
    stubUrls();
    const { customNetworkConfig } = await loadCustomNetworkConfig();
    expect(customNetworkConfig).toEqual({
      bitcoinNetworkMode: 'regtest',
      name: 'Private',
      key: 'private',
      bitcoinApiUrl: 'https://mempool.bitcoin.private-1.hiro.so/api',
      stacksApiUrl: 'https://api.private-1.hiro.so',
      stacksChainId: 2147483648,
    });
  });

  test('is null when bitcoin network mode is set but api urls are missing', async () => {
    vi.stubEnv('LEATHER_PRIVATE_NETWORK_FLAVOR', 'regtest');
    const { customNetworkConfig } = await loadCustomNetworkConfig();
    expect(customNetworkConfig).toBeNull();
  });

  test('defaults name/key and leaves chain-id undefined when unset', async () => {
    vi.stubEnv('LEATHER_PRIVATE_NETWORK_FLAVOR', 'regtest');
    stubUrls();
    const { customNetworkConfig } = await loadCustomNetworkConfig();
    expect(customNetworkConfig?.name).toBe('Private');
    expect(customNetworkConfig?.key).toBe('private');
    expect(customNetworkConfig?.stacksChainId).toBeUndefined();
  });
});
