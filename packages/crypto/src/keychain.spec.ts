import { describe, expect, test } from 'vitest';

import { testMnemonic } from '@leather.io/test-config';
import { createNullArrayOfLength } from '@leather.io/utils';

import {
  deriveBip39SeedFromMnemonic,
  deriveKeychainExtendedPublicKeyDescriptor,
  deriveRootBip32Keychain,
  generateMnemonic,
  getMnemonicRootKeyFingerprint,
  getMnemonicRootKeyFingerprintBroken,
  makeAccountIdentifer,
  safelyReadPaddedFingerprint,
} from './keychain';

const passphrase = 'abandoned cactus';

describe(getMnemonicRootKeyFingerprint.name, () => {
  test('it derives the correct fingerprint of test mnemonic', async () =>
    expect(await getMnemonicRootKeyFingerprint(testMnemonic)).toEqual('24682ead'));

  test('it derives the correct fingerprint of test mnemonic with passphrase', async () =>
    expect(await getMnemonicRootKeyFingerprint(testMnemonic, passphrase)).toEqual('984c5aea'));

  test.each(
    createNullArrayOfLength(40)
      .fill(null)
      .map(() => generateMnemonic())
  )('it always derives a 4 byte length hex string, 8 chars', async value => {
    const result = await getMnemonicRootKeyFingerprint(value);
    expect(result.length).toEqual(8);
  });

  test('known leading zero case mnemonic', async () => {
    const knownLeadingZeroMnemonic =
      'figure theory skirt system gasp birth clump exile leg trade matter noise uniform phrase wine oil bird guess dirt deer shoe sketch already bacon';

    const wrongResult = await getMnemonicRootKeyFingerprintBroken(knownLeadingZeroMnemonic);

    expect(wrongResult).toEqual('30b34f3');
    expect(wrongResult.length).toEqual(7);

    const correctResult = await getMnemonicRootKeyFingerprint(knownLeadingZeroMnemonic);
    expect(correctResult).toEqual('030b34f3');
    expect(correctResult.length).toEqual(8);
  });
});

// test safelyReadPaddedFingerprint
describe(safelyReadPaddedFingerprint.name, () => {
  test('it pads fingerprint hex strings shorter than 8 characters', () => {
    expect(safelyReadPaddedFingerprint('1a2b3c')).toEqual('001a2b3c');
    expect(safelyReadPaddedFingerprint('abcdefg')).toEqual('0abcdefg');
  });

  test('it returns fingerprint hex strings of length 8 unchanged', () => {
    expect(safelyReadPaddedFingerprint('12345678')).toEqual('12345678');
    expect(safelyReadPaddedFingerprint('87654321')).toEqual('87654321');
  });
});

describe(deriveKeychainExtendedPublicKeyDescriptor.name, () => {
  test('it derives the correct account descriptor', async () => {
    const keychain = deriveRootBip32Keychain(await deriveBip39SeedFromMnemonic(testMnemonic));
    expect(deriveKeychainExtendedPublicKeyDescriptor(keychain, "m/84'/0'/0'")).toEqual(
      "[24682ead/84'/0'/0']xpub6D4nuUzLPukRYKmb6ZYxo5khwLJXHarYQutgauqv8UkAVV8NHw23UZPDoXdJZDqv5hHiyh55jCER2KuYt2a7Egnoj7TF8u7scsJbJPeCneM"
    );
    expect(deriveKeychainExtendedPublicKeyDescriptor(keychain, "m/84'/0'/1'")).toEqual(
      "[24682ead/84'/0'/1']xpub6D4nuUzLPukRaXBXWK55p8s7FCZmmXrhHJU7UJFxc9SMyYVFe4TQCYge95zsshNFk2NNxSRKPg1DGAEv5Gbuy5c7XLg1RawjokbTHD5sV3K"
    );
  });

  test('it throws an error when deriving from non-root keychain', async () => {
    const keychain = deriveRootBip32Keychain(await deriveBip39SeedFromMnemonic(testMnemonic));
    expect(() =>
      deriveKeychainExtendedPublicKeyDescriptor(keychain.derive("m/84'/0'/0'"), "m/84'/0'/0'")
    ).toThrow();
  });
});

const fingerprint = 'yg82822e';
const accountIndex = 42;
const accountId = 'yg82822e/42';

describe(makeAccountIdentifer.name, () => {
  test('it makes correct accountId', () => {
    expect(makeAccountIdentifer(fingerprint, accountIndex)).toEqual(accountId);
  });
});
