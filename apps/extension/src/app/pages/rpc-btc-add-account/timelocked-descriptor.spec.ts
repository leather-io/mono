import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { describe, expect, it } from 'vitest';

import {
  compileWshDescriptor,
  instantiateBondDescriptor,
  makeNativeSegwitAccountKeychain,
  makeNativeSegwitAccountXpub,
  makeNativeSegwitAddressPubkeyHex,
} from '@leather.io/bitcoin';

import { findTimelockedVaultAccountKey, matchTimelockedDescriptor } from './timelocked-descriptor';

const xpubA = makeNativeSegwitAccountXpub(1);
const xpubB = makeNativeSegwitAccountXpub(2);
const xpubC = makeNativeSegwitAccountXpub(3);
const counterpartyKey = `${makeNativeSegwitAccountXpub(9)}/0/0`;
const hash = bytesToHex(sha256(new Uint8Array([1, 2, 3])));
const unlockHeight = 1000;

function makeBondDescriptor(vaultExpression: string, counterparty = counterpartyKey) {
  return `wsh(and_v(v:or_i(after(${unlockHeight}),and_v(v:sha256(${hash}),pk(${counterparty}))),${vaultExpression}))`;
}

describe(matchTimelockedDescriptor.name, () => {
  it('extracts the spend paths and vault policy from a multisig-vault bond', () => {
    const bondDescriptor = instantiateBondDescriptor({
      unlockHeight,
      hash,
      counterpartyKey,
      threshold: 2,
      keyExpressions: [`${xpubA}/0/0`, `${xpubB}/0/0`, `${xpubC}/0/0`],
    });
    expect(matchTimelockedDescriptor(bondDescriptor)).toEqual({
      unlockHeight,
      hash,
      counterpartyKey,
      vaultKind: 'multi',
      vaultThreshold: 2,
      vaultKeyExpressions: [`${xpubA}/0/0`, `${xpubB}/0/0`, `${xpubC}/0/0`],
    });
  });

  it('reports a pk vault as a single owner key', () => {
    expect(matchTimelockedDescriptor(makeBondDescriptor(`pk(${xpubA}/0/0)`))).toEqual({
      unlockHeight,
      hash,
      counterpartyKey,
      vaultKind: 'pk',
      vaultThreshold: 1,
      vaultKeyExpressions: [`${xpubA}/0/0`],
    });
  });

  it('keeps a 1 of 1 sortedmulti vault distinct from a pk vault', () => {
    expect(matchTimelockedDescriptor(makeBondDescriptor(`sortedmulti(1,${xpubA}/0/0)`))).toEqual({
      unlockHeight,
      hash,
      counterpartyKey,
      vaultKind: 'multi',
      vaultThreshold: 1,
      vaultKeyExpressions: [`${xpubA}/0/0`],
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
    expect(matchTimelockedDescriptor(makeBondDescriptor(`pk(${rawKeyA})`))).toMatchObject({
      vaultKind: 'pk',
      vaultThreshold: 1,
      vaultKeyExpressions: [rawKeyA],
    });
    expect(
      matchTimelockedDescriptor(makeBondDescriptor(`sortedmulti(2,${rawKeyA},${rawKeyB})`))
    ).toMatchObject({
      vaultKind: 'multi',
      vaultThreshold: 2,
      vaultKeyExpressions: [rawKeyA, rawKeyB],
    });
  });

  it('returns null for a bond whose vault key is an uncompressed public key', () => {
    const uncompressedKey = `04${makeNativeSegwitAddressPubkeyHex(1).slice(2)}`;
    expect(matchTimelockedDescriptor(makeBondDescriptor(`pk(${uncompressedKey})`))).toBeNull();
  });
});

describe(findTimelockedVaultAccountKey.name, () => {
  function findVaultKeyFor(descriptor: string, seedByte: number) {
    const timelock = matchTimelockedDescriptor(descriptor);
    if (!timelock) throw new Error('Expected a bond descriptor');
    return findTimelockedVaultAccountKey(
      compileWshDescriptor(descriptor),
      timelock,
      makeNativeSegwitAccountKeychain(seedByte)
    );
  }

  const vaultBond = makeBondDescriptor(`sortedmulti(2,${xpubA}/0/0,${xpubB}/0/0)`);

  it('finds the account key when it is a vault signer', () => {
    expect(findVaultKeyFor(vaultBond, 1)?.key.keyExpression).toBe(`${xpubA}/0/0`);
    expect(findVaultKeyFor(vaultBond, 2)?.key.keyExpression).toBe(`${xpubB}/0/0`);
  });

  it('does not match an account that only holds the counterparty key', () => {
    expect(findVaultKeyFor(vaultBond, 9)).toBeUndefined();
  });

  it('does not match an account that is in neither slot', () => {
    expect(findVaultKeyFor(vaultBond, 3)).toBeUndefined();
  });

  it('matches a vault key that carries a key origin', () => {
    const withOrigin = makeBondDescriptor(
      `sortedmulti(2,[aabbccdd/84'/0'/0']${xpubA}/0/0,${xpubB}/0/0)`
    );
    expect(findVaultKeyFor(withOrigin, 1)?.key.keyExpression).toBe(
      `[aabbccdd/84'/0'/0']${xpubA}/0/0`
    );
  });

  it('matches a raw public key vault signer by its 0/0 address key', () => {
    const rawKeyA = makeNativeSegwitAddressPubkeyHex(1);
    const rawVaultBond = makeBondDescriptor(`sortedmulti(2,${rawKeyA},${xpubB}/0/0)`);
    expect(findVaultKeyFor(rawVaultBond, 1)?.key.keyExpression).toBe(rawKeyA);
  });

  it('does not match an account whose raw key is only the counterparty', () => {
    const rawCounterparty = makeNativeSegwitAddressPubkeyHex(9);
    const rawCounterpartyBond = makeBondDescriptor(
      `sortedmulti(2,${xpubA}/0/0,${xpubB}/0/0)`,
      rawCounterparty
    );
    expect(findVaultKeyFor(rawCounterpartyBond, 9)).toBeUndefined();
    expect(findVaultKeyFor(rawCounterpartyBond, 1)?.key.keyExpression).toBe(`${xpubA}/0/0`);
  });
});
