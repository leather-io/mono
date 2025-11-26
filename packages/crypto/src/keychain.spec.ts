import { describe, expect, test } from 'vitest';

import { testMnemonic } from '@leather.io/test-config';

import {
  deriveBip39SeedFromMnemonic,
  deriveKeychainExtendedPublicKeyDescriptor,
  deriveRootBip32Keychain,
  getMnemonicRootKeyFingerprint,
  makeAccountIdentifer,
} from './keychain';

const passphrase = 'abandoned cactus';

describe(getMnemonicRootKeyFingerprint.name, () => {
  test('it derives the correct fingerprint of test mnemonic', async () =>
    expect(await getMnemonicRootKeyFingerprint(testMnemonic)).toEqual('24682ead'));

  test('it derives the correct fingerprint of test mnemonic with passphrase', async () =>
    expect(await getMnemonicRootKeyFingerprint(testMnemonic, passphrase)).toEqual('984c5aea'));
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
