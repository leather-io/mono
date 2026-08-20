import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { hex } from '@scure/base';
import { Script } from '@scure/btc-signer';
import { describe, expect, it } from 'vitest';

import { makeNativeSegwitAccountXpub, makeNativeSegwitAddressPubkeyHex } from '../mocks/key-mocks';
import { parseBondLockScript } from './bond-lock-script';
import { getBondVaultKeys, instantiateBondDescriptor } from './bond-template';
import { compileWshDescriptor } from './wsh-descriptor';

const pub1 = '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798';
const pub2 = '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5';
const pub3 = '03f028892bad7ed57d2fb57bf33081d5cfcf6f9ed3d3d7f159c2e2fff579dc341a';
const lockedHash = '8548c6565547d9dde2dc97e8a57a62446a084cbb187581d07256bca62d3f8aee';

// Golden vectors from @stacks/bitcoin-staking@7.5.1-pr.1854.0 buildLockScript (covenant = pub1, staker leaf = multi of the named keys).
const lock2of2Height1000 =
  '6302e803b16782012088a8208548c6565547d9dde2dc97e8a57a62446a084cbb187581d07256bca62d3f8aee88210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ac686952210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f817982102c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee552ae';
const lock2of3Height850000 =
  '630350f80cb16782012088a8208548c6565547d9dde2dc97e8a57a62446a084cbb187581d07256bca62d3f8aee88210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ac686952210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f817982102c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee52103f028892bad7ed57d2fb57bf33081d5cfcf6f9ed3d3d7f159c2e2fff579dc341a53ae';
const lockSingleSig =
  '6302e803b16782012088a8208548c6565547d9dde2dc97e8a57a62446a084cbb187581d07256bca62d3f8aee88210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ac6869210279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ac';

function mutateLockScript(mutate: (ops: ReturnType<typeof Script.decode>) => void): Uint8Array {
  const ops = Script.decode(hex.decode(lock2of2Height1000));
  mutate(ops);
  return Script.encode(ops);
}

describe(parseBondLockScript.name, () => {
  it('parses the SDK-built 2-of-2 lock script exactly', () => {
    const parsed = parseBondLockScript(hex.decode(lock2of2Height1000));
    expect(parsed).not.toBeNull();
    expect(parsed!.unlockHeight).toBe(1000);
    expect(parsed!.hashHex).toBe(lockedHash);
    expect(parsed!.covenantPubkey).toBe(pub1);
    expect(parsed!.threshold).toBe(2);
    expect(parsed!.stakerPubkeys).toEqual([pub1, pub2]);
  });

  it('parses a 2-of-3 lock at a realistic burn height', () => {
    const parsed = parseBondLockScript(hex.decode(lock2of3Height850000));
    expect(parsed).not.toBeNull();
    expect(parsed!.unlockHeight).toBe(850_000);
    expect(parsed!.threshold).toBe(2);
    expect(parsed!.stakerPubkeys).toEqual([pub1, pub2, pub3]);
  });

  it('round-trips the witness script compiled from an instantiated bond descriptor', () => {
    const stakerSeedBytes = [1, 2, 3];
    const policyDescriptor = `wsh(sortedmulti(2,${stakerSeedBytes
      .map(seedByte => `${makeNativeSegwitAccountXpub(seedByte)}/0/0`)
      .join(',')}))`;
    const hash = bytesToHex(sha256(new Uint8Array([1, 2, 3])));
    const counterpartyKey = `${makeNativeSegwitAccountXpub(9)}/0/0`;
    const bondDescriptor = instantiateBondDescriptor({
      unlockHeight: 1000,
      hash,
      counterpartyKey,
      ...getBondVaultKeys(policyDescriptor),
    });

    const { witnessScript } = compileWshDescriptor(bondDescriptor);
    const parsed = parseBondLockScript(witnessScript);
    expect(parsed).not.toBeNull();
    expect(parsed!.unlockHeight).toBe(1000);
    expect(parsed!.hashHex).toBe(hash);
    expect(parsed!.covenantPubkey).toBe(makeNativeSegwitAddressPubkeyHex(9));
    expect(parsed!.threshold).toBe(2);
    expect([...parsed!.stakerPubkeys].sort()).toEqual(
      stakerSeedBytes.map(seedByte => makeNativeSegwitAddressPubkeyHex(seedByte)).sort()
    );
  });

  it('returns null for a single-sig lock script', () => {
    expect(parseBondLockScript(hex.decode(lockSingleSig))).toBeNull();
  });

  it('returns null for a bare multisig script', () => {
    const bareMultisig = Script.encode([2, hex.decode(pub1), hex.decode(pub2), 2, 'CHECKMULTISIG']);
    expect(parseBondLockScript(bareMultisig)).toBeNull();
  });

  it('returns null for undecodable or truncated bytes', () => {
    expect(parseBondLockScript(hex.decode('ff'))).toBeNull();
    expect(parseBondLockScript(hex.decode(lock2of2Height1000).slice(0, -1))).toBeNull();
  });

  it('returns null when the branch structure deviates', () => {
    expect(parseBondLockScript(mutateLockScript(ops => (ops[0] = 'NOTIF')))).toBeNull();
    expect(parseBondLockScript(mutateLockScript(ops => (ops[11] = 'CHECKSIGVERIFY')))).toBeNull();
    expect(parseBondLockScript(mutateLockScript(ops => ops.splice(13, 1)))).toBeNull();
    expect(parseBondLockScript(mutateLockScript(ops => ops.push('VERIFY')))).toBeNull();
  });

  it('returns null on malformed slot values', () => {
    expect(
      parseBondLockScript(mutateLockScript(ops => (ops[8] = new Uint8Array(31).fill(1))))
    ).toBeNull();
    expect(
      parseBondLockScript(mutateLockScript(ops => (ops[10] = new Uint8Array(32).fill(2))))
    ).toBeNull();
    expect(parseBondLockScript(mutateLockScript(ops => (ops[14] = 3)))).toBeNull();
  });

  it('returns null on a non-minimal unlock-height encoding', () => {
    const nonMinimal = mutateLockScript(ops => (ops[1] = Uint8Array.from([0xe8, 0x03, 0x00])));
    expect(parseBondLockScript(nonMinimal)).toBeNull();
  });

  it('returns null on a timestamp-typed unlock height', () => {
    // 500,000,000 (0x1DCD6500 LE) — the BIP-65 boundary where lock values become timestamps
    const timestampLock = mutateLockScript(
      ops => (ops[1] = Uint8Array.from([0x00, 0x65, 0xcd, 0x1d]))
    );
    expect(parseBondLockScript(timestampLock)).toBeNull();
  });

  it('returns null on keys without a compressed-pubkey prefix', () => {
    const uncompressed = new Uint8Array(33).fill(0x11);
    uncompressed[0] = 0x04;
    expect(parseBondLockScript(mutateLockScript(ops => (ops[10] = uncompressed)))).toBeNull();
    expect(parseBondLockScript(mutateLockScript(ops => (ops[15] = uncompressed)))).toBeNull();
  });
});
