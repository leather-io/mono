import { afterEach, describe, expect, test, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function loadResolver() {
  vi.resetModules();
  return import('./resolve-btc-network-mode');
}

function stubRegtestNetwork() {
  vi.stubEnv('LEATHER_PRIVATE_NETWORK_FLAVOR', 'regtest');
  vi.stubEnv('LEATHER_BITCOIN_API_URL', 'https://bitcoin.example/api');
  vi.stubEnv('LEATHER_STACKS_API_URL', 'https://stacks.example');
}

describe('resolveBtcNetworkMode', () => {
  test('btc:mainnet resolves to mainnet with no custom network', async () => {
    const { resolveBtcNetworkMode } = await loadResolver();
    expect(resolveBtcNetworkMode('btc:mainnet')).toBe('mainnet');
  });

  test('btc:testnet resolves to testnet with no custom network', async () => {
    const { resolveBtcNetworkMode } = await loadResolver();
    expect(resolveBtcNetworkMode('btc:testnet')).toBe('testnet');
  });

  test('btc:testnet stays testnet when a custom regtest network is active', async () => {
    stubRegtestNetwork();
    const { resolveBtcNetworkMode } = await loadResolver();
    expect(resolveBtcNetworkMode('btc:testnet')).toBe('testnet');
  });

  test('btc:regtest resolves to regtest', async () => {
    const { resolveBtcNetworkMode } = await loadResolver();
    expect(resolveBtcNetworkMode('btc:regtest')).toBe('regtest');
  });

  test('btc:mainnet stays mainnet even when a custom regtest network is active', async () => {
    stubRegtestNetwork();
    const { resolveBtcNetworkMode } = await loadResolver();
    expect(resolveBtcNetworkMode('btc:mainnet')).toBe('mainnet');
  });
});
