import { ChainId } from '@stacks/network';
import { describe, expect, it } from 'vitest';

import {
  HIRO_API_BASE_URL_MAINNET,
  HIRO_API_BASE_URL_TESTNET,
  WalletDefaultNetworkConfigurationIds,
  defaultNetworksKeyedById,
} from '@leather.io/models';

import { getStacksNetworkFromName, getStacksNetworkFromNetworkConfig } from './settings.read';

describe(getStacksNetworkFromNetworkConfig.name, () => {
  it('returns correct config for mainnet', () => {
    const mainnetConfig = defaultNetworksKeyedById[WalletDefaultNetworkConfigurationIds.mainnet];

    const result = getStacksNetworkFromNetworkConfig(mainnetConfig);

    expect(result.chainId).toBe(ChainId.Mainnet);
    expect(result.client.baseUrl).toBe(HIRO_API_BASE_URL_MAINNET);
  });

  it('returns correct config for testnet', () => {
    const testnetConfig = defaultNetworksKeyedById[WalletDefaultNetworkConfigurationIds.testnet4];

    const result = getStacksNetworkFromNetworkConfig(testnetConfig);

    expect(result.chainId).toBe(ChainId.Testnet);
    expect(result.client.baseUrl).toBe(HIRO_API_BASE_URL_TESTNET);
  });
});

describe(getStacksNetworkFromName.name, () => {
  it('resolves mainnet correctly', () => {
    const result = getStacksNetworkFromName('mainnet');

    expect(result.chainId).toBe(ChainId.Mainnet);
    expect(result.client.baseUrl).toBe(HIRO_API_BASE_URL_MAINNET);
  });

  it('resolves testnet correctly', () => {
    const result = getStacksNetworkFromName('testnet');

    expect(result.chainId).toBe(ChainId.Testnet);
    expect(result.client.baseUrl).toBe(HIRO_API_BASE_URL_TESTNET);
  });

  it('throws for unknown network name', () => {
    expect(() => getStacksNetworkFromName('devnet' as 'mainnet')).toThrow(
      'This network is currently not supported'
    );
  });
});
