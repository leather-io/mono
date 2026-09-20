import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { describe, expect, it } from 'vitest';

import { makeNativeSegwitAccountXpub, makeNativeSegwitAddressPubkeyHex } from '../mocks/key-mocks';
import { buildLedgerWalletPolicy, ledgerWalletPolicyName } from './ledger-wallet-policy';
import { compileWshDescriptor } from './wsh-descriptor';

const testnetExtendedKeyVersions = { private: 0x04358394, public: 0x043587cf };
function makeNativeSegwitAccountTpub(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte), testnetExtendedKeyVersions).derive(
    "m/84'/1'/0'"
  ).publicExtendedKey;
}

const deviceFingerprint = 'deadbeef';
const deviceOrigin = `${deviceFingerprint}/84'/0'/0'`;
const xpubA = makeNativeSegwitAccountXpub(1);
const xpubB = makeNativeSegwitAccountXpub(2);
const xpubC = makeNativeSegwitAccountXpub(3);
const deviceKeyA = `[${deviceOrigin}]${xpubA}`;

const fifteenXpubs = [
  'xpub6DFfyxrMEUfR9Fyczq5xK1m8C3zKfi97mZDt3u4UnjjaWPW8q1PY4UogPFbdp4ibSDnmaHZrNCUYwmzj2GjBYVcaJMvniK2chBMqdbebH5f',
  'xpub6DFfyxrMEUfRVkk7Mn3yBkgdvEUMKgcd84ejLXXjaBNANrzdTGDZTNrMV4DGEJJcVwQsirvmuqJTbESpZGtcmMr1p2kTDELcmZNf3zqdaVo',
  'xpub6DFfyxrMEUfRGTzteDuwAgnWJNMyk5oFnFpHzJ3FZVdhNbUUjQrum1yzZ8pRkSNnYik9f7nZQHVbX2QmVxjQg9QdwhwJBJ5BVU1eNiJn9nx',
  'xpub6DFfyxrMEUfRjgfEnMSnQb1eSdjYoEYgXTHewSDSj535cdV3YvebBLDv3E8Jf9Gnw6o5cjgrH2fJ7pQUP68FHLBuz7pzut3sCHByNb8732w',
  'xpub6DFfyxrMEUfRTAEKrZYkCysQbApw3uPfhdB1JL4ezrMVsXu5dxzTzBjow5BGhHS34RoEZ9fGAotYmgHV3cFkhtNwa9scg47dgj9rcSskGxw',
  'xpub6DFfyxrMEUfRNx8MU68Exh7Zu8m9AahHqyhJzPWa9agwTaqzrPQ3nUqF9HcRL5Whg7w84EgETN82MfUDhQPKYBRngSz5Rmm3YBYUPnqGews',
  'xpub6DFfyxrMEUfRArb44TcHbuHeGQ1qx3KWKsnykm6XMorKSWpCbnMESPHTZVPG3Tu4c7cdm1nPUxVB7214hkniqtYGYy2tXjP4unaobdPH3Wi',
  'xpub6DFfyxrMEUfRMHhGfByZfeAocsHvYtuCj5y1KQWrpEgjUrKS8oV2i8FGaVoWWRp71Uz3n4LmPBjnyQFq2GJt6CAozVtUoAVqwg88Zccagcs',
  'xpub6DFfyxrMEUfRa2jkv1Ust48Awz8gWHQG4np1VimCYeKinGTfY4isY4V2Dwv293YhTCrP65XYSRVagWuoYmsQJmucDZSd8L5XzdyhrQrtSdq',
  'xpub6DFfyxrMEUfRCQn3cPkudoGamQQZgExLUepcHduymGMBCBLEZgCoBXrjUWmzF74HXzPMYvsKdL25usDyKYV5PkHtYrM2oSg29j7wj4gu6vW',
  'xpub6DFfyxrMEUfRgPmwjxB4sZSyEYd4rUsBcUbDYSze8ZL3o89pyhmTG8aQtEfS5c7tca2FzELbdcMkWt8kZrz3u1gAvMnUasARzXfAUXRg7Ku',
  'xpub6DFfyxrMEUfRJ1VrRHkReKDvHt8rVtACtAPSEgDdFLsgWMidSVJmELN6o7mAg3vzsyCxHNxTWbK8py8JsBGG6eE1gyxkXSHW257iGJmGYuw',
  'xpub6DFfyxrMEUfRdCQ5En5AshvRG8hqtSgt4yP8ZJ7F5mA9NDSY52KCHKuUdqasXaKcuobZXM9NXsKyWDauWakidQ714EypKUZKkMNWNQb72Na',
  'xpub6DFfyxrMEUfRWfkdXNhAwEaVG2q2md4ot1TVw8CbFmZLGTg98S2TthV1nZ1DPyNhtzvvSNtrP4JMFFaJccB8uycFZyULZSoKLzvvtDCTLZr',
  'xpub6DFfyxrMEUfRfRfqddybvT2DvpkiVQAfsPawivjpQQNwPcYf9PW8KqUDztU7SSxvbwGiRcJwNqJZT2FSVMZ4xz2evdVnPWrJdPS1M52Y5ZH',
];

function stripKeyOrigin(policyKey: string) {
  return policyKey.replace(/^\[[^\]]+\]/, '');
}

function derivePolicyKeyPubkey(policyKey: string, changeIndex: number, addressIndex: number) {
  const { publicKey } = HDKey.fromExtendedKey(stripKeyOrigin(policyKey))
    .deriveChild(changeIndex)
    .deriveChild(addressIndex);
  if (!publicKey) throw new Error('Expected public key bytes to be defined');
  return publicKey;
}

describe(buildLedgerWalletPolicy.name, () => {
  it('keeps the key order of a multi descriptor and prefixes only the device key', () => {
    const policy = buildLedgerWalletPolicy(
      `wsh(multi(2,${xpubB}/0/0,${deviceKeyA}/0/0))`,
      deviceFingerprint
    );

    expect(policy).toEqual({
      name: ledgerWalletPolicyName,
      descriptorTemplate: 'wsh(multi(2,@0/**,@1/**))',
      keys: [xpubB, deviceKeyA],
    });
  });

  it('rewrites sortedmulti into multi in BIP67 order that reproduces the witness script', () => {
    const descriptor = `wsh(sortedmulti(2,${xpubC}/0/0,${deviceKeyA}/0/0,${xpubB}/0/0))`;

    const policy = buildLedgerWalletPolicy(descriptor, deviceFingerprint);

    expect(policy.descriptorTemplate).toBe('wsh(multi(2,@0/**,@1/**,@2/**))');
    expect(policy.keys).toHaveLength(3);
    expect(policy.keys).toContain(deviceKeyA);
    const pubkeys = policy.keys.map(key => derivePolicyKeyPubkey(key, 0, 0));
    expect(pubkeys.map(bytesToHex)).toEqual([...pubkeys.map(bytesToHex)].sort());
    expect(bytesToHex(compileWshDescriptor(descriptor).witnessScript)).toBe(
      bytesToHex(btc.p2ms(2, pubkeys).script)
    );
  });

  it('matches the device fingerprint case-insensitively', () => {
    const policy = buildLedgerWalletPolicy(
      `wsh(multi(2,${xpubB}/0/0,${deviceKeyA}/0/0))`,
      deviceFingerprint.toUpperCase()
    );

    expect(policy.keys).toEqual([xpubB, deviceKeyA]);
  });

  it('builds a 15-key sortedmulti policy without corrupting any key', () => {
    const deviceKey = `[${deviceOrigin}]${fifteenXpubs[0]}`;
    const keyExpressions = [deviceKey, ...fifteenXpubs.slice(1)].map(key => `${key}/0/0`);

    const policy = buildLedgerWalletPolicy(
      `wsh(sortedmulti(2,${keyExpressions.join(',')}))`,
      deviceFingerprint
    );

    expect(policy.descriptorTemplate).toBe(
      `wsh(multi(2,${Array.from({ length: 15 }, (_, i) => `@${i}/**`).join(',')}))`
    );
    expect(policy.keys).toHaveLength(15);
    expect(policy.keys).toContain(deviceKey);
    expect([...policy.keys.map(stripKeyOrigin)].sort()).toEqual([...fifteenXpubs].sort());
  });

  it('builds the bond template with the counterparty key first and the vault keys sorted', () => {
    const hash = bytesToHex(sha256(new Uint8Array([1, 2, 3])));
    const counterpartyXpub = makeNativeSegwitAccountXpub(9);
    const descriptor = `wsh(and_v(v:or_i(after(1000),and_v(v:sha256(${hash}),pk(${counterpartyXpub}/0/7))),sortedmulti(2,${deviceKeyA}/0/7,${xpubB}/0/7)))`;

    const policy = buildLedgerWalletPolicy(descriptor, deviceFingerprint);

    expect(policy.descriptorTemplate).toBe(
      `wsh(and_v(v:or_i(after(1000),and_v(v:sha256(${hash}),pk(@0/**))),multi(2,@1/**,@2/**)))`
    );
    expect(policy.keys[0]).toBe(counterpartyXpub);
    expect(policy.keys.slice(1)).toHaveLength(2);
    expect(policy.keys.slice(1)).toContain(deviceKeyA);
    expect(policy.keys.slice(1)).toContain(xpubB);
  });

  it('rejects a raw public key counterparty', () => {
    const hash = bytesToHex(sha256(new Uint8Array([1, 2, 3])));
    const descriptor = `wsh(and_v(v:or_i(after(1000),and_v(v:sha256(${hash}),pk(${makeNativeSegwitAddressPubkeyHex(9)}))),sortedmulti(2,${deviceKeyA}/0/0,${xpubB}/0/0)))`;

    expect(() => buildLedgerWalletPolicy(descriptor, deviceFingerprint)).toThrow(
      'Ledger only allows extended public keys in a wallet policy'
    );
  });

  it('keeps testnet extended keys and origins verbatim', () => {
    const tpubA = makeNativeSegwitAccountTpub(1);
    const tpubB = makeNativeSegwitAccountTpub(2);
    const deviceTpub = `[${deviceFingerprint}/84'/1'/0']${tpubA}`;

    const policy = buildLedgerWalletPolicy(
      `wsh(multi(2,${deviceTpub}/0/0,${tpubB}/0/0))`,
      deviceFingerprint
    );

    expect(policy.keys).toEqual([deviceTpub, tpubB]);
  });

  it('rejects a descriptor the device is absent from', () => {
    expect(() =>
      buildLedgerWalletPolicy(`wsh(multi(2,${xpubB}/0/0,${deviceKeyA}/0/0))`, 'cafebabe')
    ).toThrow('The connected Ledger is absent from this descriptor');
  });

  it('rejects a descriptor the device appears in more than once', () => {
    const secondDeviceKey = `[${deviceFingerprint}/84'/0'/1']${xpubC}`;

    expect(() =>
      buildLedgerWalletPolicy(
        `wsh(multi(2,${secondDeviceKey}/0/0,${deviceKeyA}/0/0))`,
        deviceFingerprint
      )
    ).toThrow('The connected Ledger appears more than once in this descriptor');
  });

  it('rejects keys with mismatched key paths', () => {
    expect(() =>
      buildLedgerWalletPolicy(`wsh(multi(2,${xpubB}/0/1,${deviceKeyA}/0/0))`, deviceFingerprint)
    ).toThrow('All keys in a Ledger wallet policy must use the same key path');
  });

  it('rejects keys with mismatched origin paths', () => {
    const otherOriginB = `[cafebabe/48'/0'/0'/2']${xpubB}`;

    expect(() =>
      buildLedgerWalletPolicy(
        `wsh(multi(2,${otherOriginB}/0/0,${deviceKeyA}/0/0))`,
        deviceFingerprint
      )
    ).toThrow('All keys in a Ledger wallet policy must use the same origin path');
  });

  it('rejects a device key path that is not of the form /0/N or /1/N', () => {
    expect(() =>
      buildLedgerWalletPolicy(`wsh(multi(2,${xpubB}/*,${deviceKeyA}/*))`, deviceFingerprint)
    ).toThrow('Ledger wallet policy keys must use a key path of the form /0/N or /1/N');
  });

  it('resolves a ranged key path at the requested index', () => {
    const policy = buildLedgerWalletPolicy(
      `wsh(multi(2,${xpubB}/0/*,${deviceKeyA}/0/*))`,
      deviceFingerprint,
      3
    );

    expect(policy.keys).toEqual([xpubB, deviceKeyA]);
  });

  it('rejects a policy name longer than 64 characters', () => {
    expect(() =>
      buildLedgerWalletPolicy(
        `wsh(multi(2,${xpubB}/0/0,${deviceKeyA}/0/0))`,
        deviceFingerprint,
        0,
        'x'.repeat(65)
      )
    ).toThrow('Ledger wallet policy name must be at most 64 characters');
  });
});
