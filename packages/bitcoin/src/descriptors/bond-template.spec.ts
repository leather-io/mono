import { checksum } from '@bitcoinerlab/descriptors';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import { describe, expect, it } from 'vitest';

import {
  makeNativeSegwitAccountKeychain,
  makeNativeSegwitAccountXpub,
  makeNativeSegwitAddressPubkeyHex,
} from '../mocks/key-mocks';
import {
  getBondVaultKeys,
  instantiateBondDescriptor,
  matchBondDescriptor,
  matchBondTemplateDescriptor,
  reconstructBondDescriptor,
} from './bond-template';
import {
  compileWshDescriptor,
  findAccountDescriptorKey,
  getWshDescriptorAddress,
} from './wsh-descriptor';

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

  it('accepts a multi vault leaf', () => {
    const multiForm = makeBondDescriptor(`multi(2,${xpubA}/0/7,${xpubB}/0/7,${xpubC}/0/7)`);
    const match = matchBondDescriptor(multiForm);
    expect(match?.unlockHeight).toBe(unlockHeight);
    expect(match?.multiExpression).toBe(`multi(2,${xpubA}/0/7,${xpubB}/0/7,${xpubC}/0/7)`);
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

  it('accepts a raw compressed pubkey counterparty and lowercases it', () => {
    const rawCounterparty = makeNativeSegwitAddressPubkeyHex(9);
    const match = matchBondDescriptor(bondDescriptor.replace(counterpartyKey, rawCounterparty));
    expect(match?.counterpartyKey).toBe(rawCounterparty);

    const uppercased = matchBondDescriptor(
      bondDescriptor.replace(counterpartyKey, rawCounterparty.toUpperCase())
    );
    expect(uppercased?.counterpartyKey).toBe(rawCounterparty);
  });

  it('rejects an uncompressed pubkey or private key counterparty', () => {
    const rawCounterparty = makeNativeSegwitAddressPubkeyHex(9);
    expect(
      matchBondDescriptor(bondDescriptor.replace(counterpartyKey, `04${rawCounterparty.slice(2)}`))
    ).toBeNull();

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

  it('returns null for a single-signer pk vault', () => {
    expect(matchBondDescriptor(makeBondDescriptor(`pk(${xpubA}/0/7)`))).toBeNull();
  });
});

describe('matchBondTemplateDescriptor', () => {
  it('extracts params and a multi vault leaf', () => {
    expect(matchBondTemplateDescriptor(bondDescriptor)).toEqual({
      unlockHeight,
      hash,
      counterpartyKey,
      vault: {
        kind: 'multi',
        expression: `sortedmulti(2,${xpubA}/0/7,${xpubB}/0/7,${xpubC}/0/7)`,
        threshold: 2,
        keyExpressions: [`${xpubA}/0/7`, `${xpubB}/0/7`, `${xpubC}/0/7`],
      },
    });
  });

  it('accepts a single-signer pk vault leaf that compiles and matches the account key', () => {
    const pkVault = makeBondDescriptor(`pk(${xpubA}/0/7)`);
    expect(matchBondTemplateDescriptor(pkVault)?.vault).toEqual({
      kind: 'pk',
      expression: `pk(${xpubA}/0/7)`,
      threshold: 1,
      keyExpressions: [`${xpubA}/0/7`],
    });

    const compiled = compileWshDescriptor(pkVault);
    const accountKey = findAccountDescriptorKey(compiled, makeNativeSegwitAccountKeychain(1));
    expect(accountKey?.addressIndex).toBe(7);
    expect(findAccountDescriptorKey(compiled, makeNativeSegwitAccountKeychain(2))).toBeUndefined();
  });

  it('accepts an origin-prefixed pk vault key', () => {
    const withOrigin = makeBondDescriptor(`pk([aabbccdd/84'/0'/0']${xpubA}/0/7)`);
    expect(matchBondTemplateDescriptor(withOrigin)?.vault.kind).toBe('pk');
  });

  it('accepts raw compressed vault keys that matchBondDescriptor rejects', () => {
    const rawKeyA = makeNativeSegwitAddressPubkeyHex(1);
    const rawKeyB = makeNativeSegwitAddressPubkeyHex(2);

    const rawMulti = makeBondDescriptor(`sortedmulti(2,${rawKeyA},${rawKeyB})`);
    expect(matchBondTemplateDescriptor(rawMulti)?.vault).toEqual({
      kind: 'multi',
      expression: `sortedmulti(2,${rawKeyA},${rawKeyB})`,
      threshold: 2,
      keyExpressions: [rawKeyA, rawKeyB],
    });
    expect(matchBondDescriptor(rawMulti)).toBeNull();

    const mixedMulti = makeBondDescriptor(`sortedmulti(2,${xpubA}/0/7,${rawKeyB})`);
    expect(matchBondTemplateDescriptor(mixedMulti)?.vault.keyExpressions).toEqual([
      `${xpubA}/0/7`,
      rawKeyB,
    ]);
    expect(matchBondDescriptor(mixedMulti)).toBeNull();

    const rawPk = makeBondDescriptor(`pk(${rawKeyA})`);
    expect(matchBondTemplateDescriptor(rawPk)?.vault).toEqual({
      kind: 'pk',
      expression: `pk(${rawKeyA})`,
      threshold: 1,
      keyExpressions: [rawKeyA],
    });
    const compiled = compileWshDescriptor(rawPk);
    expect(
      findAccountDescriptorKey(compiled, makeNativeSegwitAccountKeychain(1))?.key.pubkey
    ).toEqual(hexToBytes(rawKeyA));
  });

  it('rejects pk vault leaves that are not a single public key', () => {
    const rawKeyA = makeNativeSegwitAddressPubkeyHex(1);
    expect(matchBondTemplateDescriptor(makeBondDescriptor(`pk(04${rawKeyA.slice(2)})`))).toBeNull();

    const xprvA = HDKey.fromMasterSeed(new Uint8Array(32).fill(1)).derive(
      "m/84'/0'/0'"
    ).privateExtendedKey;
    expect(matchBondTemplateDescriptor(makeBondDescriptor(`pk(${xprvA}/0/7)`))).toBeNull();
    expect(
      matchBondTemplateDescriptor(makeBondDescriptor(`pk(${xpubA}/0/7,${xpubB}/0/7)`))
    ).toBeNull();
  });

  it('rejects descriptors that are not the bond template shape', () => {
    expect(matchBondTemplateDescriptor(policyDescriptor)).toBeNull();
    expect(matchBondTemplateDescriptor(`wsh(pk(${xpubA}/0/7))`)).toBeNull();
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
    expect(matchBondTemplateDescriptor(instantiated)?.vault.kind).toBe('multi');
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

  it('compiles a pre-sorted multi leaf to the same script as the sortedmulti instantiation', () => {
    const instantiated = instantiateBondDescriptor({
      unlockHeight,
      hash,
      counterpartyKey,
      ...vaultKeys,
    });
    const sortedKeyExpressions = [1, 2, 3]
      .map(seedByte => ({
        keyExpression: `${makeNativeSegwitAccountXpub(seedByte)}/0/7`,
        pubkeyHex: makeNativeSegwitAddressPubkeyHex(seedByte, 7),
      }))
      .sort((a, b) => (a.pubkeyHex < b.pubkeyHex ? -1 : 1))
      .map(({ keyExpression }) => keyExpression);
    const multiForm = makeBondDescriptor(`multi(2,${sortedKeyExpressions.join(',')})`);

    const compiledInstantiated = compileWshDescriptor(instantiated);
    const compiledMultiForm = compileWshDescriptor(multiForm);
    expect(bytesToHex(compiledMultiForm.scriptPubKey)).toBe(
      bytesToHex(compiledInstantiated.scriptPubKey)
    );
    expect(bytesToHex(compiledMultiForm.witnessScript)).toBe(
      bytesToHex(compiledInstantiated.witnessScript)
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

  it('accepts a raw compressed pubkey counterparty and compiles like reconstructBondDescriptor', () => {
    const covenantPubkey = makeNativeSegwitAddressPubkeyHex(9, 7);
    const instantiated = instantiateBondDescriptor({
      unlockHeight,
      hash,
      counterpartyKey: covenantPubkey,
      ...vaultKeys,
    });
    expect(matchBondDescriptor(instantiated)?.counterpartyKey).toBe(covenantPubkey);

    const reconstructed = reconstructBondDescriptor({
      unlockHeight,
      hash,
      covenantPubkey,
      ...vaultKeys,
    });
    expect(bytesToHex(compileWshDescriptor(instantiated).scriptPubKey)).toBe(
      bytesToHex(compileWshDescriptor(reconstructed).scriptPubKey)
    );
  });

  it('throws on invalid params', () => {
    const validArgs = { unlockHeight, hash, counterpartyKey, ...vaultKeys };
    const rawCounterparty = makeNativeSegwitAddressPubkeyHex(9);
    expect(() => instantiateBondDescriptor({ ...validArgs, unlockHeight: 500_000_000 })).toThrow();
    expect(() => instantiateBondDescriptor({ ...validArgs, unlockHeight: 0 })).toThrow();
    expect(() => instantiateBondDescriptor({ ...validArgs, hash: hash.slice(0, 10) })).toThrow();
    expect(() =>
      instantiateBondDescriptor({
        ...validArgs,
        counterpartyKey: `04${rawCounterparty.slice(2)}`,
      })
    ).toThrow();
    expect(() =>
      instantiateBondDescriptor({
        ...validArgs,
        counterpartyKey: rawCounterparty.toUpperCase(),
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
