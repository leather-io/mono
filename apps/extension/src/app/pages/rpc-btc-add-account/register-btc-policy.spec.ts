import { HDKey } from '@scure/bip32';
import { describe, expect, test } from 'vitest';

import { type NetworkConfiguration, defaultNetworksKeyedById } from '@leather.io/models';

import { createBtcPolicyRegistration } from './btc-policy-registration';

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

describe(createBtcPolicyRegistration.name, () => {
  test('uses the requested network for BTC address derivation and policy identity', () => {
    const registration = createBtcPolicyRegistration({
      params: { ...baseParams, network: 'testnet' },
      fingerprint: 'deadbeef',
      accountIndex: 0,
      networks,
    });

    expect(registration.result.address.startsWith('tb1q')).toBe(true);
    expect(registration.addPolicyPayload.policy).toEqual(
      expect.objectContaining({
        id: `deadbeef/0/${registration.result.address}/testnet`,
        networkId: 'testnet',
        address: registration.result.address,
      })
    );
  });

  test('defaults to mainnet when the request omits network', () => {
    const registration = createBtcPolicyRegistration({
      params: baseParams,
      fingerprint: 'deadbeef',
      accountIndex: 0,
      networks,
    });

    expect(registration.result.address.startsWith('bc1q')).toBe(true);
    expect(registration.addPolicyPayload.policy.networkId).toBe('mainnet');
  });

  test('rejects an unknown requested network instead of defaulting to mainnet', () => {
    expect(() =>
      createBtcPolicyRegistration({
        params: { ...baseParams, network: 'unknown-network' },
        fingerprint: 'deadbeef',
        accountIndex: 0,
        networks,
      })
    ).toThrow('Unknown BTC add account network: unknown-network');
  });
});
