import { checksum } from '@bitcoinerlab/descriptors';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import { describe, expect, it } from 'vitest';

import { makeNativeSegwitAccountXpub, makeNativeSegwitAddressPubkeyHex } from '../mocks/key-mocks';
import {
  getBondVaultKeys,
  instantiateBondDescriptor,
  matchBondDescriptor,
  reconstructBondDescriptor,
} from './bond-template';
import { compileWshDescriptor, getWshDescriptorAddress } from './wsh-descriptor';

const xpubA = makeNativeSegwitAccountXpub(1);
const xpubB = makeNativeSegwitAccountXpub(2);
const xpubC = makeNativeSegwitAccountXpub(3);
const counterpartyKey = `${makeNativeSegwitAccountXpub(9)}/0/7`;
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
    const rawKeyA = makeNativeSegwitAddressPubkeyHex(1);
    const rawKeyB = makeNativeSegwitAddressPubkeyHex(2);
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

  it('lowercases the captured hash and preserves the counterparty key expression', () => {
    const uppercasedHash = `wsh(and_v(v:or_i(after(${unlockHeight}),and_v(v:sha256(${hash.toUpperCase()}),pk(${counterpartyKey}))),sortedmulti(2,${xpubA}/0/7,${xpubB}/0/7)))`;
    const match = matchBondDescriptor(uppercasedHash);
    expect(match?.hash).toBe(hash);
    expect(match?.counterpartyKey).toBe(counterpartyKey);
  });

  it('rejects a raw pubkey or private key counterparty', () => {
    const rawCounterparty = makeNativeSegwitAddressPubkeyHex(9);
    expect(matchBondDescriptor(bondDescriptor.replace(counterpartyKey, rawCounterparty))).toBeNull();

    const xprv = HDKey.fromMasterSeed(new Uint8Array(32).fill(9)).derive(
      "m/84'/0'/0'"
    ).privateExtendedKey;
    expect(matchBondDescriptor(bondDescriptor.replace(counterpartyKey, `${xprv}/0/0`))).toBeNull();
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
      matchBondDescriptor(bondDescriptor.replace(counterpartyKey, 'not-a-key/0/0'))
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

  it('derives a p2wsh address alongside the vault xpubs and a counterparty key expression', () => {
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
      instantiateBondDescriptor({
        ...validArgs,
        counterpartyKey: makeNativeSegwitAddressPubkeyHex(9),
      })
    ).toThrow();
    expect(() => instantiateBondDescriptor({ ...validArgs, keyExpressions: [] })).toThrow();
    expect(() =>
      instantiateBondDescriptor({
        ...validArgs,
        keyExpressions: [makeNativeSegwitAddressPubkeyHex(1), makeNativeSegwitAddressPubkeyHex(2)],
      })
    ).toThrow();
  });
});

describe('reconstructBondDescriptor', () => {
  const vaultKeys = getBondVaultKeys(policyDescriptor);
  const covenantPubkey = makeNativeSegwitAddressPubkeyHex(9, 7);

  it('compiles to the same script as the xpub-instantiated descriptor', () => {
    const instantiated = instantiateBondDescriptor({
      unlockHeight,
      hash,
      counterpartyKey,
      ...vaultKeys,
    });
    const reconstructed = reconstructBondDescriptor({
      unlockHeight,
      hash,
      covenantPubkey,
      ...vaultKeys,
    });
    expect(bytesToHex(compileWshDescriptor(reconstructed).witnessScript)).toBe(
      bytesToHex(compileWshDescriptor(instantiated).witnessScript)
    );
    expect(bytesToHex(compileWshDescriptor(reconstructed).scriptPubKey)).toBe(
      bytesToHex(compileWshDescriptor(instantiated).scriptPubKey)
    );
  });

  it('throws when the covenant key is not raw compressed lowercase hex', () => {
    const validArgs = { unlockHeight, hash, covenantPubkey, ...vaultKeys };
    expect(() =>
      reconstructBondDescriptor({ ...validArgs, covenantPubkey: counterpartyKey })
    ).toThrow();
    expect(() =>
      reconstructBondDescriptor({ ...validArgs, covenantPubkey: `04${covenantPubkey.slice(2)}` })
    ).toThrow();
    expect(() =>
      reconstructBondDescriptor({ ...validArgs, covenantPubkey: covenantPubkey.toUpperCase() })
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
