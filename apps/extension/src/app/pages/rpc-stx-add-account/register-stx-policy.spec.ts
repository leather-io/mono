import { describe, expect, test } from 'vitest';

import { type NetworkConfiguration, defaultNetworksKeyedById } from '@leather.io/models';

import { createStxPolicyRegistration } from './stx-policy-registration';

const pubkeyA = '031b84c5567b126440995d3ed5aaba0565d71e1834604819ff9c17f5e9d5dd078f';
const pubkeyB = '024d4b6cd1361032ca9bd2aeb9d900aa4d45d9ead80ac9423374c451a7254d0766';

const networks = defaultNetworksKeyedById as Record<string, NetworkConfiguration>;

const baseParams = {
  publicKeys: [pubkeyA, pubkeyB],
  threshold: 2,
  name: 'Treasury vault',
};

describe(createStxPolicyRegistration.name, () => {
  test('uses the requested network for STX address derivation and policy identity', () => {
    const registration = createStxPolicyRegistration({
      params: { ...baseParams, network: 'testnet' },
      fingerprint: 'deadbeef',
      accountIndex: 0,
      defaultNetwork: defaultNetworksKeyedById.mainnet,
      defaultNetworkId: 'mainnet',
      networks,
    });

    expect(registration.result.address).toBe('SN3CFXKD81GREH6MYFW4P9VKSSR2N525W3K30KYER');
    expect(registration.addPolicyPayload.policy).toEqual(
      expect.objectContaining({
        id: 'deadbeef/0/SN3CFXKD81GREH6MYFW4P9VKSSR2N525W3K30KYER/testnet',
        networkId: 'testnet',
        address: registration.result.address,
      })
    );
  });

  test('falls back to the default network when the request omits network', () => {
    const registration = createStxPolicyRegistration({
      params: baseParams,
      fingerprint: 'deadbeef',
      accountIndex: 0,
      defaultNetwork: defaultNetworksKeyedById.mainnet,
      defaultNetworkId: 'mainnet',
      networks,
    });

    expect(registration.result.address).toBe('SM3CFXKD81GREH6MYFW4P9VKSSR2N525W3KDRH3P1');
    expect(registration.addPolicyPayload.policy.networkId).toBe('mainnet');
  });

  test('rejects an unknown requested network instead of falling back to the active network', () => {
    expect(() =>
      createStxPolicyRegistration({
        params: { ...baseParams, network: 'unknown-network' },
        fingerprint: 'deadbeef',
        accountIndex: 0,
        defaultNetwork: defaultNetworksKeyedById.mainnet,
        defaultNetworkId: 'mainnet',
        networks,
      })
    ).toThrow('Unknown STX add account network: unknown-network');
  });
});
