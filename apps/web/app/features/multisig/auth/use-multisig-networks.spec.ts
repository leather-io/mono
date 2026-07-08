import { afterEach, describe, expect, test, vi } from 'vitest';

async function loadNetworks() {
  vi.resetModules();
  return import('./multisig-networks');
}

function stubCustomNetwork(bitcoinNetworkMode: 'regtest' | 'testnet') {
  vi.stubEnv('LEATHER_PRIVATE_NETWORK_FLAVOR', bitcoinNetworkMode);
  vi.stubEnv('LEATHER_BITCOIN_API_URL', 'https://bitcoin.example/api');
  vi.stubEnv('LEATHER_STACKS_API_URL', 'https://stacks.example');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('resolveMultisigNetworks', () => {
  test('resolves mainnet networks', async () => {
    const { resolveMultisigNetworks } = await loadNetworks();
    expect(resolveMultisigNetworks('mainnet')).toEqual({
      btc: 'btc:mainnet',
      stx: 'stx:mainnet',
    });
  });

  test('resolves public testnet networks', async () => {
    const { resolveMultisigNetworks } = await loadNetworks();
    expect(resolveMultisigNetworks('testnet')).toEqual({
      btc: 'btc:testnet',
      stx: 'stx:testnet',
    });
  });

  test('resolves custom testnet bitcoin network mode as btc:testnet and stx:testnet', async () => {
    stubCustomNetwork('testnet');
    const { resolveMultisigNetworks } = await loadNetworks();
    expect(resolveMultisigNetworks('testnet')).toEqual({
      btc: 'btc:testnet',
      stx: 'stx:testnet',
    });
  });

  test('resolves custom regtest bitcoin network mode as btc:regtest and stx:testnet', async () => {
    stubCustomNetwork('regtest');
    const { resolveMultisigNetworks } = await loadNetworks();
    expect(resolveMultisigNetworks('testnet')).toEqual({
      btc: 'btc:regtest',
      stx: 'stx:testnet',
    });
  });
});
