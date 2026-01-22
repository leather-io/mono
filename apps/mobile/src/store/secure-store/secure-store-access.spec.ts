import * as SecureStore from 'expo-secure-store';
import { describe, expect, test, vi } from 'vitest';

import { searchForMnemonic } from './secure-store-access';
import { getSecureStoreKeys } from './secure-store-keys';

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
}));

// NOTE: don't like mocking lingui here but couldn't find a better way to handle this
vi.mock('@lingui/core/macro', () => ({
  t: (s: string) => s,
}));

function mockSecureStore(store: Record<string, string>) {
  vi.mocked(SecureStore.getItemAsync).mockImplementation(key => {
    return Promise.resolve(store[key] ?? null);
  });
}

const fingerprintV1 = 'f25e8';
const fingerprintV2 = '000f25e8';
const nonExistantFingerprint = '24682ead';
const secretMnemonic = 'pssst_mnemonic';
const secretPassphrase = 'pssst_passphrase';

describe(searchForMnemonic.name, () => {
  test('search for v2 mnemonic correctly (no passphrase)', async () => {
    mockSecureStore({
      [`mnemonic_v2_${fingerprintV2}`]: secretMnemonic,
    });
    expect(await searchForMnemonic(getSecureStoreKeys(fingerprintV2))).toEqual({
      mnemonic: secretMnemonic,
      passphrase: null,
      storeKeys: {
        mnemonicStoreKey: `mnemonic_v2_${fingerprintV2}`,
        passphraseStoreKey: `mnemonic_v2_passphrase_${fingerprintV2}`,
      },
    });
  });

  test('search for v2 mnemonic correctly (with passphrase)', async () => {
    mockSecureStore({
      [`mnemonic_v2_${fingerprintV2}`]: secretMnemonic,
      [`mnemonic_v2_passphrase_${fingerprintV2}`]: secretPassphrase,
    });
    expect(await searchForMnemonic(getSecureStoreKeys(fingerprintV2))).toEqual({
      mnemonic: secretMnemonic,
      passphrase: secretPassphrase,
      storeKeys: {
        mnemonicStoreKey: 'mnemonic_v2_000f25e8',
        passphraseStoreKey: 'mnemonic_v2_passphrase_000f25e8',
      },
    });
  });

  test('search for v1 mnemonic correctly (no passphrase)', async () => {
    mockSecureStore({
      [fingerprintV1]: secretMnemonic,
    });
    expect(await searchForMnemonic(getSecureStoreKeys(fingerprintV1))).toEqual({
      mnemonic: secretMnemonic,
      passphrase: null,
      storeKeys: {
        mnemonicStoreKey: fingerprintV1,
        passphraseStoreKey: `${fingerprintV1}_passphrase`,
      },
    });
  });

  test('search for v1 mnemonic correctly (with passphrase)', async () => {
    mockSecureStore({
      [fingerprintV1]: secretMnemonic,
      [`${fingerprintV1}_passphrase`]: secretPassphrase,
    });
    expect(await searchForMnemonic(getSecureStoreKeys(fingerprintV1))).toEqual({
      mnemonic: secretMnemonic,
      passphrase: secretPassphrase,
      storeKeys: {
        mnemonicStoreKey: fingerprintV1,
        passphraseStoreKey: `${fingerprintV1}_passphrase`,
      },
    });
  });

  test('search with non-existant fingerprint', async () => {
    mockSecureStore({
      [`mnemonic_v2_${fingerprintV2}`]: secretMnemonic,
    });
    expect(await searchForMnemonic(getSecureStoreKeys('24682ead'))).toEqual({
      mnemonic: null,
      passphrase: null,
      storeKeys: null,
    });
  });

  test('search with non-existant fingerprint', async () => {
    mockSecureStore({
      [`mnemonic_v2_${fingerprintV2}`]: secretMnemonic,
    });
    expect(await searchForMnemonic(getSecureStoreKeys(nonExistantFingerprint))).toEqual({
      mnemonic: null,
      passphrase: null,
      storeKeys: null,
    });
  });

  test('search with non-existant fingerprint', async () => {
    mockSecureStore({
      [`mnemonic_v2_${fingerprintV2}`]: secretMnemonic,
    });
    expect(await searchForMnemonic(getSecureStoreKeys(nonExistantFingerprint))).toEqual({
      mnemonic: null,
      passphrase: null,
      storeKeys: null,
    });
  });
});
