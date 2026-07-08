import { getDefaultStore } from 'jotai';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { CustomNetworkConfig } from '~/constants/custom-network-config';
import { networkNameAtom } from '~/store/stacks-network';

import { defaultNetworksKeyedById } from '@leather.io/models';

import { WebSettingsService } from './web-settings.service';

const mocks = vi.hoisted(() => ({ customNetworkConfig: null as CustomNetworkConfig | null }));

vi.mock('~/constants/custom-network-config', () => ({
  get customNetworkConfig() {
    return mocks.customNetworkConfig;
  },
}));

const store = getDefaultStore();
const service = new WebSettingsService();

afterEach(() => {
  mocks.customNetworkConfig = null;
  store.set(networkNameAtom, 'mainnet');
});

describe('WebSettingsService', () => {
  test('returns the default network config when no custom network is active', () => {
    store.set(networkNameAtom, 'testnet');
    expect(service.getSettings().network).toBe(defaultNetworksKeyedById.testnet);
  });

  test('overrides the testnet slot with the custom network when active', () => {
    mocks.customNetworkConfig = {
      bitcoinNetworkMode: 'regtest',
      name: 'Private',
      key: 'private',
      bitcoinApiUrl: 'https://mempool.bitcoin.private-1.hiro.so/api',
      stacksApiUrl: 'https://api.private-1.hiro.so',
      stacksChainId: 2147483648,
    };
    store.set(networkNameAtom, 'testnet');
    const { network } = service.getSettings();
    expect(network.id).toBe('private');
    expect(network.chain.bitcoin.mode).toBe('regtest');
    expect(network.chain.bitcoin.bitcoinUrl).toBe('https://mempool.bitcoin.private-1.hiro.so/api');
    expect(network.chain.stacks.url).toBe('https://api.private-1.hiro.so');
  });

  test('leaves mainnet untouched even when a custom network is active', () => {
    mocks.customNetworkConfig = {
      bitcoinNetworkMode: 'regtest',
      name: 'Private',
      key: 'private',
      bitcoinApiUrl: 'https://mempool.bitcoin.private-1.hiro.so/api',
      stacksApiUrl: 'https://api.private-1.hiro.so',
      stacksChainId: 2147483648,
    };
    store.set(networkNameAtom, 'mainnet');
    expect(service.getSettings().network).toBe(defaultNetworksKeyedById.mainnet);
  });
});
