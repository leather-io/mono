import { describe, expect, test } from 'vitest';

import {
  deriveAccountDescriptor,
  deriveBip39SeedFromMnemonic,
  deriveRootBip32Keychain,
  getMnemonicRootKeyFingerprint,
} from './keychain';

const mnemonic =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon cactus';

describe(getMnemonicRootKeyFingerprint.name, () => {
  test('it derives the correct fingerprint of test mnemonic', async () =>
    expect(await getMnemonicRootKeyFingerprint(mnemonic)).toEqual('24682ead'));
});

describe(deriveAccountDescriptor.name, () => {
  test('it derives the correct account descriptor', async () => {
    const keychain = deriveRootBip32Keychain(await deriveBip39SeedFromMnemonic(mnemonic));
    expect(deriveAccountDescriptor(keychain, "m/84'/0'/0'")).toEqual(
      "[24682ead/84'/0'/0']xpub6D4nuUzLPukRYKmb6ZYxo5khwLJXHarYQutgauqv8UkAVV8NHw23UZPDoXdJZDqv5hHiyh55jCER2KuYt2a7Egnoj7TF8u7scsJbJPeCneM"
    );
    expect(deriveAccountDescriptor(keychain, "m/84'/0'/1'")).toEqual(
      "[24682ead/84'/0'/1']xpub6D4nuUzLPukRaXBXWK55p8s7FCZmmXrhHJU7UJFxc9SMyYVFe4TQCYge95zsshNFk2NNxSRKPg1DGAEv5Gbuy5c7XLg1RawjokbTHD5sV3K"
    );
  });

  test('it throws an error when deriving from non-root keychain', async () => {
    const keychain = deriveRootBip32Keychain(await deriveBip39SeedFromMnemonic(mnemonic));
    expect(() => deriveAccountDescriptor(keychain.derive("m/84'/0'/0'"), "m/84'/0'/0'")).toThrow();
  });
});
