import { describe, expect, it } from 'vitest';

import { WalletDefaultNetworkConfigurationIds } from '@leather.io/models';

import { resolveNetworkPreference, resolveNetworkPreferenceId } from './network-preferences';

describe('resolveNetworkPreferenceId', () => {
  it('returns typed ids when provided with known values', () => {
    expect(resolveNetworkPreferenceId('mainnet')).toEqual(
      WalletDefaultNetworkConfigurationIds.mainnet
    );
    expect(resolveNetworkPreferenceId('testnet')).toEqual(
      WalletDefaultNetworkConfigurationIds.testnet
    );
  });

  it('returns mocknet when provided mocknet', () => {
    expect(resolveNetworkPreferenceId('mocknet')).toEqual('mocknet');
  });

  it('throws for unknown identifiers', () => {
    expect(() => resolveNetworkPreferenceId('unknown-network')).toThrow('Unsupported network id');
  });
});

describe('resolveNetworkPreference', () => {
  it('resolves mocknet to the default testnet configuration', () => {
    const result = resolveNetworkPreference({ id: 'mocknet' });
    expect(result.id).toEqual(WalletDefaultNetworkConfigurationIds.testnet);
  });

  it('resolves known ids directly', () => {
    const result = resolveNetworkPreference({ id: WalletDefaultNetworkConfigurationIds.mainnet });
    expect(result.id).toEqual(WalletDefaultNetworkConfigurationIds.mainnet);
  });
});
