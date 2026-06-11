import { HDKey } from '@scure/bip32';
import { describe, expect, it } from 'vitest';

import { HD_KEY_VERSIONS_BY_NETWORK } from '@leather.io/constants';
import { deriveBip39SeedFromMnemonic } from '@leather.io/crypto';
import { testMnemonic } from '@leather.io/test-config';

import { deriveAddressesFromDescriptor, extractXpubFromDescriptor } from './bitcoin.descriptors';

const mainnetXpub =
  'xpub6D4nuUzLPukRYKmb6ZYxo5khwLJXHarYQutgauqv8UkAVV8NHw23UZPDoXdJZDqv5hHiyh55jCER2KuYt2a7Egnoj7TF8u7scsJbJPeCneM';

async function deriveTestnetAccountTpub(path: string) {
  const rootKeychain = HDKey.fromMasterSeed(
    await deriveBip39SeedFromMnemonic(testMnemonic),
    HD_KEY_VERSIONS_BY_NETWORK.testnet
  );
  return rootKeychain.derive(path).publicExtendedKey;
}

describe(extractXpubFromDescriptor.name, () => {
  it('should extract xpub encoded keys', () => {
    expect(extractXpubFromDescriptor(`wpkh(${mainnetXpub})`)).toEqual(mainnetXpub);
  });

  it('should extract tpub encoded keys', async () => {
    const tpub = await deriveTestnetAccountTpub("m/84'/1'/0'");
    expect(tpub.startsWith('tpub')).toBeTruthy();
    expect(extractXpubFromDescriptor(`wpkh(${tpub})`)).toEqual(tpub);
  });

  it('should throw on invalid descriptors', () => {
    expect(() => extractXpubFromDescriptor('wpkh(invalid)')).toThrow();
  });
});

describe(deriveAddressesFromDescriptor.name, () => {
  it('should derive mainnet addresses from an xpub descriptor', () => {
    const results = deriveAddressesFromDescriptor({
      accountDescriptor: `wpkh(${mainnetXpub})`,
      network: 'mainnet',
    });
    expect(results).toHaveLength(2);
    results.forEach(result => expect(result.address.startsWith('bc1q')).toBeTruthy());
  });

  it('should derive regtest native segwit addresses from a tpub descriptor', async () => {
    const tpub = await deriveTestnetAccountTpub("m/84'/1'/0'");
    const results = deriveAddressesFromDescriptor({
      accountDescriptor: `wpkh(${tpub})`,
      network: 'regtest',
    });
    expect(results).toHaveLength(2);
    results.forEach(result => expect(result.address.startsWith('bcrt1q')).toBeTruthy());
    expect(results[0].path).toEqual("m/84'/1'/0'/0/0");
  });

  it('should derive regtest taproot addresses from a tpub descriptor', async () => {
    const tpub = await deriveTestnetAccountTpub("m/86'/1'/0'");
    const results = deriveAddressesFromDescriptor({
      accountDescriptor: `tr(${tpub})`,
      network: 'regtest',
    });
    expect(results).toHaveLength(2);
    results.forEach(result => expect(result.address.startsWith('bcrt1p')).toBeTruthy());
  });
});
