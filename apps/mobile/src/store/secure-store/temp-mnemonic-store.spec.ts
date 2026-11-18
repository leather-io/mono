import * as SecureStore from 'expo-secure-store';
import { describe, expect, test, vi } from 'vitest';

import { tempMnemonicStore } from './temp-mnemonic-store';

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

function mockSecureStore(initialStore: Record<string, string>) {
  let store: Record<string, string | null> = { ...initialStore };
  vi.mocked(SecureStore.getItemAsync).mockImplementation(key => {
    return Promise.resolve(store[key] ?? null);
  });
  vi.mocked(SecureStore.setItemAsync).mockImplementation((key, value) => {
    store = { ...store, [key]: value };

    return Promise.resolve();
  });
  vi.mocked(SecureStore.deleteItemAsync).mockImplementation(key => {
    store = {
      ...store,
      [key]: null,
    };
    return Promise.resolve();
  });
}

const secretMnemonic = 'pssst_mnemonic';
const secretMnemonic2 = 'pssst_mnemonic2';
const secretPassphrase = 'pssst_passphrase';

describe('tempMnemonicStore', () => {
  test('set mnemonic without passphrase, get returns no passphrase', async () => {
    mockSecureStore({});
    await tempMnemonicStore.setTemporaryMnemonic(secretMnemonic);
    expect(await tempMnemonicStore.getTemporaryMnemonic()).toEqual({
      mnemonic: secretMnemonic,
      passphrase: null,
    });
  });

  test('set mnemonic with passphrase, get returns both', async () => {
    mockSecureStore({});
    await tempMnemonicStore.setTemporaryMnemonic(secretMnemonic, secretPassphrase);
    expect(await tempMnemonicStore.getTemporaryMnemonic()).toEqual({
      mnemonic: secretMnemonic,
      passphrase: secretPassphrase,
    });
  });

  test('set without passphrase clears a passphrase left by a previous set', async () => {
    mockSecureStore({});
    await tempMnemonicStore.setTemporaryMnemonic(secretMnemonic, secretPassphrase);
    await tempMnemonicStore.setTemporaryMnemonic(secretMnemonic2);
    expect(await tempMnemonicStore.getTemporaryMnemonic()).toEqual({
      mnemonic: secretMnemonic2,
      passphrase: null,
    });
  });

  test('set with passphrase replaces both values of a previous set', async () => {
    mockSecureStore({});
    await tempMnemonicStore.setTemporaryMnemonic(secretMnemonic, 'stale_passphrase');
    await tempMnemonicStore.setTemporaryMnemonic(secretMnemonic2, secretPassphrase);
    expect(await tempMnemonicStore.getTemporaryMnemonic()).toEqual({
      mnemonic: secretMnemonic2,
      passphrase: secretPassphrase,
    });
  });

  test('delete removes both mnemonic and passphrase', async () => {
    mockSecureStore({});
    await tempMnemonicStore.setTemporaryMnemonic(secretMnemonic, secretPassphrase);
    await tempMnemonicStore.deleteTemporaryMnemonic();
    expect(await tempMnemonicStore.getTemporaryMnemonic()).toEqual({
      mnemonic: null,
      passphrase: null,
    });
  });
});
