import { checksum } from '@bitcoinerlab/descriptors';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import { describe, expect, it } from 'vitest';

import { getBondVaultKeys, instantiateBondDescriptor, matchBondDescriptor } from './bond-template';
import { compileWshDescriptor, getWshDescriptorAddress } from './wsh-descriptor';

function makeNativeSegwitAccountXpub(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte)).derive("m/84'/0'/0'")
    .publicExtendedKey;
}

function makeAddressPubkeyHex(seedByte: number) {
  return bytesToHex(
    HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte))
      .derive("m/84'/0'/0'")
      .deriveChild(0)
      .deriveChild(0).publicKey!
  );
}

const xpubA = makeNativeSegwitAccountXpub(1);
const xpubB = makeNativeSegwitAccountXpub(2);
const xpubC = makeNativeSegwitAccountXpub(3);
const counterpartyKey = makeAddressPubkeyHex(9);
const hash = bytesToHex(sha256(new Uint8Array([1, 2, 3])));
const unlockHeight = 1000;

const policyDescriptor = `wsh(sortedmulti(2,${xpubA}/0/7,${xpubB}/0/7,${xpubC}/0/7))`;

function makeBondDescriptor(multiExpression: string) {
  return `wsh(and_v(v:or_i(after(${unlockHeight}),and_v(v:sha256(${hash}),pk(${counterpartyKey}))),${multiExpression}))`;
}

const bondDescriptor = makeBondDescriptor(`sortedmulti(2,${xpubA}/0/7,${xpubB}/0/7,${xpubC}/0/7)`);

describe('matchBondDescriptor', () => {
  it('extracts params from a bond descriptor', () => {
    const match = matchBondDescriptor(bondDescriptor);
    expect(match).toEqual({
      unlockHeight,
      hash,
      counterpartyKey,
      multiExpression: `sortedmulti(2,${xpubA}/0/7,${xpubB}/0/7,${xpubC}/0/7)`,
    });
  });

  it('matches descriptors with a checksum and whitespace', () => {
    const spaced = makeBondDescriptor(`sortedmulti(2, ${xpubA}/0/7, ${xpubB}/0/7, ${xpubC}/0/7)`);
    expect(matchBondDescriptor(spaced)?.unlockHeight).toBe(unlockHeight);

    const withChecksum = `${bondDescriptor}#${checksum(bondDescriptor)}`;
    expect(matchBondDescriptor(withChecksum)?.unlockHeight).toBe(unlockHeight);
  });

  it('rejects an unsorted multi tail', () => {
    const multiForm = makeBondDescriptor(`multi(2,${xpubA}/0/7,${xpubB}/0/7,${xpubC}/0/7)`);
    expect(matchBondDescriptor(multiForm)).toBeNull();
  });

  it('rejects raw pubkeys and private keys in the vault multi', () => {
    const rawKeyA = makeAddressPubkeyHex(1);
    const rawKeyB = makeAddressPubkeyHex(2);
    expect(
      matchBondDescriptor(makeBondDescriptor(`sortedmulti(2,${rawKeyA},${rawKeyB})`))
    ).toBeNull();
    expect(
      matchBondDescriptor(makeBondDescriptor(`sortedmulti(2,${xpubA}/0/7,${rawKeyB})`))
    ).toBeNull();

    const xprvA = HDKey.fromMasterSeed(new Uint8Array(32).fill(1)).derive(
      "m/84'/0'/0'"
    ).privateExtendedKey;
    expect(
      matchBondDescriptor(makeBondDescriptor(`sortedmulti(2,${xprvA}/0/7,${xpubB}/0/7)`))
    ).toBeNull();
  });

  it('accepts origin-prefixed vault xpubs', () => {
    const withOrigin = makeBondDescriptor(
      `sortedmulti(2,[aabbccdd/48'/0'/0'/2']${xpubA}/0/7,${xpubB}/0/7)`
    );
    expect(matchBondDescriptor(withOrigin)?.unlockHeight).toBe(unlockHeight);
  });

  it('lowercases captured hex params', () => {
    const uppercased = `wsh(and_v(v:or_i(after(${unlockHeight}),and_v(v:sha256(${hash.toUpperCase()}),pk(${counterpartyKey.toUpperCase()}))),sortedmulti(2,${xpubA}/0/7,${xpubB}/0/7)))`;
    const match = matchBondDescriptor(uppercased);
    expect(match?.hash).toBe(hash);
    expect(match?.counterpartyKey).toBe(counterpartyKey);
  });

  it('rejects descriptors that are not the bond template shape', () => {
    expect(matchBondDescriptor(policyDescriptor)).toBeNull();
    expect(
      matchBondDescriptor(
        `wsh(and_v(v:or_i(and_v(v:sha256(${hash}),pk(${counterpartyKey})),after(${unlockHeight})),sortedmulti(2,${xpubA}/0/7,${xpubB}/0/7)))`
      )
    ).toBeNull();
    expect(
      matchBondDescriptor(
        `wsh(or_i(pk(${counterpartyKey}),sortedmulti(2,${xpubA}/0/7,${xpubB}/0/7)))`
      )
    ).toBeNull();
  });

  it('rejects out-of-range or malformed params', () => {
    expect(
      matchBondDescriptor(bondDescriptor.replace(`after(${unlockHeight})`, 'after(0)'))
    ).toBeNull();
    expect(
      matchBondDescriptor(bondDescriptor.replace(`after(${unlockHeight})`, 'after(500000000)'))
    ).toBeNull();
    expect(matchBondDescriptor(bondDescriptor.replace(hash, hash.slice(0, 62)))).toBeNull();
    expect(
      matchBondDescriptor(bondDescriptor.replace(counterpartyKey, `04${counterpartyKey.slice(2)}`))
    ).toBeNull();
  });
});

describe('instantiateBondDescriptor', () => {
  const vaultKeys = getBondVaultKeys(policyDescriptor);

  it('round-trips through matchBondDescriptor', () => {
    const instantiated = instantiateBondDescriptor({
      unlockHeight,
      hash,
      counterpartyKey,
      ...vaultKeys,
    });
    const match = matchBondDescriptor(instantiated);
    expect(match?.unlockHeight).toBe(unlockHeight);
    expect(match?.hash).toBe(hash);
    expect(match?.counterpartyKey).toBe(counterpartyKey);
  });

  it('compiles to the same script as a cosmetically different dApp descriptor', () => {
    const instantiated = instantiateBondDescriptor({
      unlockHeight,
      hash,
      counterpartyKey,
      ...vaultKeys,
    });
    const reordered = makeBondDescriptor(`sortedmulti(2,${xpubC}/0/7,${xpubA}/0/7,${xpubB}/0/7)`);

    const compiledInstantiated = compileWshDescriptor(instantiated);
    const compiledReordered = compileWshDescriptor(reordered);
    expect(bytesToHex(compiledInstantiated.scriptPubKey)).toBe(
      bytesToHex(compiledReordered.scriptPubKey)
    );
    expect(bytesToHex(compiledInstantiated.witnessScript)).toBe(
      bytesToHex(compiledReordered.witnessScript)
    );
  });

  it('derives a p2wsh address alongside the vault xpubs and a raw counterparty key', () => {
    const instantiated = instantiateBondDescriptor({
      unlockHeight,
      hash,
      counterpartyKey,
      ...vaultKeys,
    });
    expect(getWshDescriptorAddress(instantiated).startsWith('bc1q')).toBe(true);
  });

  it('throws on invalid params', () => {
    const validArgs = { unlockHeight, hash, counterpartyKey, ...vaultKeys };
    expect(() => instantiateBondDescriptor({ ...validArgs, unlockHeight: 500_000_000 })).toThrow();
    expect(() => instantiateBondDescriptor({ ...validArgs, unlockHeight: 0 })).toThrow();
    expect(() => instantiateBondDescriptor({ ...validArgs, hash: hash.slice(0, 10) })).toThrow();
    expect(() =>
      instantiateBondDescriptor({ ...validArgs, counterpartyKey: `04${counterpartyKey.slice(2)}` })
    ).toThrow();
    expect(() => instantiateBondDescriptor({ ...validArgs, keyExpressions: [] })).toThrow();
    expect(() =>
      instantiateBondDescriptor({
        ...validArgs,
        keyExpressions: [makeAddressPubkeyHex(1), makeAddressPubkeyHex(2)],
      })
    ).toThrow();
  });
});

describe('getBondVaultKeys', () => {
  it('reads the threshold and key expressions from a vault policy descriptor', () => {
    const { threshold, keyExpressions } = getBondVaultKeys(policyDescriptor);
    expect(threshold).toBe(2);
    expect(keyExpressions).toHaveLength(3);
    expect(keyExpressions).toEqual(
      expect.arrayContaining([`${xpubA}/0/7`, `${xpubB}/0/7`, `${xpubC}/0/7`])
    );
  });
});
