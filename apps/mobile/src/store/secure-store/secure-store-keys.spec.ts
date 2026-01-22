import { describe, expect, test } from 'vitest';

import { getSecureStoreKeyV1, getSecureStoreKeyV2, getSecureStoreKeys } from './secure-store-keys';

const fingerprintV1 = 'f25e8';
const fingerprintV2 = '000f25e8';

describe(getSecureStoreKeys.name, () => {
  test('get keys for v1', () => {
    expect(getSecureStoreKeys(fingerprintV1)).toEqual([
      {
        mnemonicStoreKey: 'f25e8',
        passphraseStoreKey: 'f25e8_passphrase',
      },
      {
        mnemonicStoreKey: 'mnemonic_v2_f25e8',
        passphraseStoreKey: 'mnemonic_v2_passphrase_f25e8',
      },
    ]);

    expect(getSecureStoreKeys(fingerprintV1)).toEqual([
      getSecureStoreKeyV1(fingerprintV1),
      getSecureStoreKeyV2(fingerprintV1),
    ]);
  });

  test('get keys for v2', () => {
    expect(getSecureStoreKeys(fingerprintV2)).toEqual([
      {
        mnemonicStoreKey: 'f25e8',
        passphraseStoreKey: 'f25e8_passphrase',
      },
      {
        mnemonicStoreKey: 'mnemonic_v2_000f25e8',
        passphraseStoreKey: 'mnemonic_v2_passphrase_000f25e8',
      },
    ]);

    expect(getSecureStoreKeys(fingerprintV2)).toEqual([
      getSecureStoreKeyV1(fingerprintV2),
      getSecureStoreKeyV2(fingerprintV2),
    ]);
  });

  test('get keys with non-existant fingerprint', () => {
    expect(() => getSecureStoreKeys('invalid fingerprint')).toThrow();
  });
});
