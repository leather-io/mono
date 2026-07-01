import { HDKey } from '@scure/bip32';
import { describe, expect, test } from 'vitest';

import { type NetworkConfiguration, defaultNetworksKeyedById } from '@leather.io/models';

import { createBtcPolicyRegistration } from './btc-policy-registration';

function makeNativeSegwitAccountXpub(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte)).derive("m/84'/0'/0'")
    .publicExtendedKey;
}

const testnetBip32Versions = { private: 0x04358394, public: 0x043587cf };

function makeNativeSegwitAccountTpub(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte), testnetBip32Versions).derive(
    "m/84'/1'/0'"
  ).publicExtendedKey;
}

const descriptor = `wsh(sortedmulti(2,${makeNativeSegwitAccountXpub(
  1
)}/0/0,${makeNativeSegwitAccountXpub(2)}/0/0))`;
const testnetDescriptor = `wsh(sortedmulti(2,${makeNativeSegwitAccountTpub(
  1
)}/0/0,${makeNativeSegwitAccountTpub(2)}/0/0))`;
const networks = defaultNetworksKeyedById as Record<string, NetworkConfiguration>;

const baseParams = {
  descriptor,
  name: 'Treasury vault',
};

describe(createBtcPolicyRegistration.name, () => {
  test('uses the requested network for BTC address derivation and policy identity', () => {
    const registration = createBtcPolicyRegistration({
      params: { ...baseParams, descriptor: testnetDescriptor, network: 'testnet' },
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

  test('returns an added result with the derived address as the account id', () => {
    const registration = createBtcPolicyRegistration({
      params: baseParams,
      fingerprint: 'deadbeef',
      accountIndex: 0,
      networks,
    });

    expect(registration.result.added).toBe(true);
    expect(registration.result.accountId).toBe(registration.result.address);
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

  test('rejects a descriptor whose network disagrees with the requested network', () => {
    expect(() =>
      createBtcPolicyRegistration({
        params: { ...baseParams, network: 'testnet' },
        fingerprint: 'deadbeef',
        accountIndex: 0,
        networks,
      })
    ).toThrow('does not match requested network');
  });
});
