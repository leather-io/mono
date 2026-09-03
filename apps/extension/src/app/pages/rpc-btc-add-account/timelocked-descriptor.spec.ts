import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { describe, expect, it } from 'vitest';

import {
  instantiateBondDescriptor,
  makeNativeSegwitAccountXpub,
  makeNativeSegwitAddressPubkeyHex,
} from '@leather.io/bitcoin';

import { matchTimelockedDescriptor } from './timelocked-descriptor';

const xpubA = makeNativeSegwitAccountXpub(1);
const xpubB = makeNativeSegwitAccountXpub(2);
const xpubC = makeNativeSegwitAccountXpub(3);
const counterpartyKey = `${makeNativeSegwitAccountXpub(9)}/0/0`;
const hash = bytesToHex(sha256(new Uint8Array([1, 2, 3])));
const unlockHeight = 1000;

function makeBondDescriptor(vaultExpression: string) {
  return `wsh(and_v(v:or_i(after(${unlockHeight}),and_v(v:sha256(${hash}),pk(${counterpartyKey}))),${vaultExpression}))`;
}

describe(matchTimelockedDescriptor.name, () => {
  it('extracts the unlock height and vault policy from a multisig-vault bond', () => {
    const bondDescriptor = instantiateBondDescriptor({
      unlockHeight,
      hash,
      counterpartyKey,
      threshold: 2,
      keyExpressions: [`${xpubA}/0/0`, `${xpubB}/0/0`, `${xpubC}/0/0`],
    });
    expect(matchTimelockedDescriptor(bondDescriptor)).toEqual({
      unlockHeight,
      vaultThreshold: 2,
      vaultKeyCount: 3,
    });
  });

  it('treats a single-signer pk vault as a 1 of 1 policy', () => {
    expect(matchTimelockedDescriptor(makeBondDescriptor(`pk(${xpubA}/0/0)`))).toEqual({
      unlockHeight,
      vaultThreshold: 1,
      vaultKeyCount: 1,
    });
  });

  it('returns null for a plain multisig descriptor', () => {
    expect(matchTimelockedDescriptor(`wsh(sortedmulti(2,${xpubA}/0/0,${xpubB}/0/0))`)).toBeNull();
  });

  it('returns null for a miniscript descriptor that is not a bond', () => {
    expect(matchTimelockedDescriptor(`wsh(and_v(v:after(1000),pk(${xpubA}/0/0)))`)).toBeNull();
  });

  it('accepts a bond whose vault keys are raw public keys', () => {
    const rawKeyA = makeNativeSegwitAddressPubkeyHex(1);
    const rawKeyB = makeNativeSegwitAddressPubkeyHex(2);
    expect(matchTimelockedDescriptor(makeBondDescriptor(`pk(${rawKeyA})`))).toEqual({
      unlockHeight,
      vaultThreshold: 1,
      vaultKeyCount: 1,
    });
    expect(
      matchTimelockedDescriptor(makeBondDescriptor(`sortedmulti(2,${rawKeyA},${rawKeyB})`))
    ).toEqual({ unlockHeight, vaultThreshold: 2, vaultKeyCount: 2 });
  });

  it('returns null for a bond whose vault key is an uncompressed public key', () => {
    const uncompressedKey = `04${makeNativeSegwitAddressPubkeyHex(1).slice(2)}`;
    expect(matchTimelockedDescriptor(makeBondDescriptor(`pk(${uncompressedKey})`))).toBeNull();
  });
});
