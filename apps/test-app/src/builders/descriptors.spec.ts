// The descriptor SHAPE is the thing that has to match production: the multisig
// dApp registers extended keys, and bond vaults reject anything else. A change
// that still compiles but sends bare public keys would quietly stop testing
// the path the wallet actually takes.
import { describe, expect, test } from 'vitest';

import { BTC_COSIGNER_XPUBS } from '../constants';
import {
  bondDescriptorFor,
  bondHash,
  compileDescriptor,
  cosignerXpubsFor,
  legacyRawPubkeyDescriptor,
  sortedMultiDescriptor,
} from './descriptors';

const ownXpub =
  'xpub6ExB1kZYquka4AHMBsA16K5QDEDQuaCgp4Scqenr1y8kmkc4mgEJtPqAYHrywBM8tZAgpbs5vgnnyvospAJCAamEaBBF8RhqhrEtCQVbgpW';
const cosigner =
  'xpub6EJrJUabyEuwV6bwVton15y57rSH27Mnv4h1gKVhYs7md8P9i1QWxhdGpHF4KtCSLYoEMvu7uNXhkM1287XhCrwi2VCjpqwH3HADqzaLqPW';

describe('sortedMultiDescriptor', () => {
  test('builds wsh(sortedmulti(k, xpub/0/index, …)) with the wallet key first', () => {
    const descriptor = sortedMultiDescriptor({ ownXpub, cosignerXpubs: [cosigner] });
    expect(descriptor).toBe(`wsh(sortedmulti(2,${ownXpub}/0/0,${cosigner}/0/0))`);
  });

  test('honours the vault account index in the key path', () => {
    const descriptor = sortedMultiDescriptor({
      ownXpub,
      cosignerXpubs: [cosigner],
      accountIndex: 3,
    });
    expect(descriptor).toContain(`${ownXpub}/0/3`);
  });

  test('refuses a threshold larger than the number of keys', () => {
    expect(() =>
      sortedMultiDescriptor({ ownXpub, cosignerXpubs: [cosigner], threshold: 3 })
    ).toThrow('exceeds');
  });

  test('compiles to a witness script the wallet can match', () => {
    const { script, witnessScript } = compileDescriptor(
      sortedMultiDescriptor({ ownXpub, cosignerXpubs: [cosigner] })
    );
    // P2WSH: OP_0 <32-byte sha256 of the witness script>.
    expect(script).toHaveLength(34);
    expect(script[0]).toBe(0x00);
    expect(witnessScript.length).toBeGreaterThan(0);
  });

  test('picks mainnet xpubs on mainnet and tpubs elsewhere', () => {
    expect(cosignerXpubsFor('mainnet')).toEqual(BTC_COSIGNER_XPUBS);
    expect(cosignerXpubsFor('regtest')[0].startsWith('tpub')).toBe(true);
    expect(cosignerXpubsFor('testnet')[0].startsWith('tpub')).toBe(true);
  });
});

describe('legacyRawPubkeyDescriptor', () => {
  test('still produces the bare-pubkey shape, for the one button that needs it', () => {
    const pubkey = new Uint8Array(33).fill(2);
    expect(legacyRawPubkeyDescriptor(pubkey)).toContain('wsh(sortedmulti(2,020202');
  });
});

describe('bondDescriptorFor', () => {
  const vaultDescriptor = sortedMultiDescriptor({ ownXpub, cosignerXpubs: [cosigner] });

  test('instantiates the bond-exit template around the vault', () => {
    const descriptor = bondDescriptorFor({ vaultDescriptor, unlockHeight: 200 });
    expect(descriptor).toContain('wsh(and_v(v:or_i(after(200)');
    expect(descriptor).toContain('sha256(');
    // The vault keys survive into the bond, which is what makes it spendable.
    expect(descriptor).toContain(ownXpub);
  });

  test('the bond output compiles to a P2WSH script', () => {
    const { script } = compileDescriptor(bondDescriptorFor({ vaultDescriptor }));
    expect(script).toHaveLength(34);
  });

  test('the hashlock digest is sha256 of the configured preimage', () => {
    expect(bondHash('00'.repeat(32))).toHaveLength(64);
    expect(bondHash('00'.repeat(32))).not.toBe(bondHash('01'.repeat(32)));
  });

  test('refuses a vault of bare public keys — bonds need extended keys', () => {
    expect(() =>
      bondDescriptorFor({ vaultDescriptor: legacyRawPubkeyDescriptor(new Uint8Array(33).fill(2)) })
    ).toThrow();
  });
});
