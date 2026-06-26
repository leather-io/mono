import { HDKey } from '@scure/bip32';
import { describe, expect, test } from 'vitest';

import { type NetworkConfiguration, defaultNetworksKeyedById } from '@leather.io/models';

import { createBtcPolicyAccountRegistration } from './register-btc-policy-account';

function makeNativeSegwitAccountXpub(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte)).derive("m/84'/0'/0'")
    .publicExtendedKey;
}

const descriptor = `wsh(sortedmulti(2,${makeNativeSegwitAccountXpub(
  1
)}/0/0,${makeNativeSegwitAccountXpub(2)}/0/0))`;
const networks = defaultNetworksKeyedById as Record<string, NetworkConfiguration>;

const baseParams = {
  descriptor,
  name: 'Treasury vault',
};

describe(createBtcPolicyAccountRegistration.name, () => {
  test('uses the requested network for BTC address derivation and policy identity', () => {
    const registration = createBtcPolicyAccountRegistration({
      params: { ...baseParams, network: 'testnet' },
      fingerprint: 'deadbeef',
      accountIndex: 0,
      defaultNetwork: defaultNetworksKeyedById.mainnet,
      defaultNetworkId: 'mainnet',
      networks,
    });

    expect(registration.result.address.startsWith('tb1q')).toBe(true);
    expect(registration.addPolicyAccountPayload.policy).toEqual(
      expect.objectContaining({
        id: `deadbeef/0/${registration.result.address}/testnet`,
        networkId: 'testnet',
        address: registration.result.address,
      })
    );
  });

  test('falls back to the default network when the request omits network', () => {
    const registration = createBtcPolicyAccountRegistration({
      params: baseParams,
      fingerprint: 'deadbeef',
      accountIndex: 0,
      defaultNetwork: defaultNetworksKeyedById.mainnet,
      defaultNetworkId: 'mainnet',
      networks,
    });

    expect(registration.result.address.startsWith('bc1q')).toBe(true);
    expect(registration.addPolicyAccountPayload.policy.networkId).toBe('mainnet');
  });

  test('rejects an unknown requested network instead of falling back to the active network', () => {
    expect(() =>
      createBtcPolicyAccountRegistration({
        params: { ...baseParams, network: 'unknown-network' },
        fingerprint: 'deadbeef',
        accountIndex: 0,
        defaultNetwork: defaultNetworksKeyedById.mainnet,
        defaultNetworkId: 'mainnet',
        networks,
      })
    ).toThrow('Unknown BTC add account network: unknown-network');
  });
});
