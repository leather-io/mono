import * as SecureStore from 'expo-secure-store';
import { describe, expect, test, vi } from 'vitest';

import type { RootState } from '..';
import { mnemonicStore } from './mnemonic-store';

vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
}));

type State = Partial<RootState>;

vi.mock('..', () => ({
  store: {
    getState() {
      return {
        settings: {
          securityLevelPreference: 'insecure' as const,
        } as State['settings'],
      } satisfies State;
    },
  },
}));

vi.mock('../settings/settings.read', () => ({
  selectSecurityLevelPreference(state: State) {
    return state.settings?.securityLevelPreference;
  },
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

const fingerprintV1 = 'f25e8';
const fingerprintV2 = '000f25e8';
const secondFingerprint = '24682ead';
const secretMnemonic = 'pssst_mnemonic';
const secretMnemonic2 = 'pssst_mnemonic2';
const secretPassphrase = 'pssst_passphrase';

describe(mnemonicStore.name, () => {
  test('add mnemonic in v1, get in v1', async () => {
    mockSecureStore({});
    await mnemonicStore(fingerprintV1).setMnemonic({
      mnemonic: secretMnemonic,
      biometrics: true,
    });
    expect(await mnemonicStore(fingerprintV1).getMnemonic()).toEqual({
      mnemonic: secretMnemonic,
      passphrase: undefined,
    });
  });

  test('add mnemonic in v1, get in v2', async () => {
    mockSecureStore({});
    await mnemonicStore(fingerprintV1).setMnemonic({
      mnemonic: secretMnemonic,
      biometrics: true,
    });
    expect(await mnemonicStore(fingerprintV2).getMnemonic()).toEqual({
      mnemonic: secretMnemonic,
      passphrase: undefined,
    });
  });

  test('add multiple mnemonics in v2, get in v2. Then delete those', async () => {
    mockSecureStore({});
    await mnemonicStore(fingerprintV2).setMnemonic({
      mnemonic: secretMnemonic,
      biometrics: true,
    });
    await mnemonicStore(secondFingerprint).setMnemonic({
      mnemonic: secretMnemonic2,
      biometrics: false,
    });
    expect(await mnemonicStore(fingerprintV2).getMnemonic()).toEqual({
      mnemonic: secretMnemonic,
      passphrase: undefined,
    });
    expect(await mnemonicStore(secondFingerprint).getMnemonic()).toEqual({
      mnemonic: secretMnemonic2,
      passphrase: undefined,
    });

    await mnemonicStore(fingerprintV2).deleteMnemonic();

    await expect(mnemonicStore(fingerprintV2).getMnemonic()).rejects.toThrow();

    expect(await mnemonicStore(secondFingerprint).getMnemonic()).toEqual({
      mnemonic: secretMnemonic2,
      passphrase: undefined,
    });

    await mnemonicStore(secondFingerprint).deleteMnemonic();

    await expect(mnemonicStore(secondFingerprint).getMnemonic()).rejects.toThrow();
  });

  test('add multiple mnemonics with and without passphrases in v2, get in v2. Then delete those', async () => {
    mockSecureStore({});
    await mnemonicStore(fingerprintV2).setMnemonic({
      mnemonic: secretMnemonic,
      passphrase: secretPassphrase,
      biometrics: true,
    });
    await mnemonicStore(secondFingerprint).setMnemonic({
      mnemonic: secretMnemonic2,
      biometrics: true,
    });
    expect(await mnemonicStore(fingerprintV2).getMnemonic()).toEqual({
      mnemonic: secretMnemonic,
      passphrase: secretPassphrase,
    });
    expect(await mnemonicStore(secondFingerprint).getMnemonic()).toEqual({
      mnemonic: secretMnemonic2,
      passphrase: undefined,
    });

    await mnemonicStore(fingerprintV2).deleteMnemonic();

    await expect(mnemonicStore(fingerprintV2).getMnemonic()).rejects.toThrow();

    expect(await mnemonicStore(secondFingerprint).getMnemonic()).toEqual({
      mnemonic: secretMnemonic2,
      passphrase: undefined,
    });

    await mnemonicStore(secondFingerprint).deleteMnemonic();

    await expect(mnemonicStore(secondFingerprint).getMnemonic()).rejects.toThrow();
  });
});
