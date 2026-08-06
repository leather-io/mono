import { base64urlnopad } from '@scure/base';

import type { PlatformUnlockConfig } from '@shared/crypto/platform-unlock';

import { readPersistedSoftwareKeyState } from './software-key-state';

const platformUnlock: PlatformUnlockConfig = {
  credentialId: base64urlnopad.encode(new Uint8Array([1, 2, 3])),
  iv: base64urlnopad.encode(new Uint8Array(12).fill(4)),
  prfInput: base64urlnopad.encode(new Uint8Array(32).fill(5)),
  registrationTag: 'ABC234',
  version: 1,
  wrappedEncryptionKey: base64urlnopad.encode(new Uint8Array(112).fill(6)),
};

describe(readPersistedSoftwareKeyState.name, () => {
  beforeEach(async () => {
    await chrome.storage.local.clear();
  });

  test('distinguishes an absent authentication slice', async () => {
    await expect(readPersistedSoftwareKeyState()).resolves.toEqual({ status: 'absent' });

    await chrome.storage.local.set({ 'persist:root': { settings: {} } });

    await expect(readPersistedSoftwareKeyState()).resolves.toEqual({ status: 'absent' });
  });

  test.each([
    null,
    { softwareKeys: null },
    { softwareKeys: { ids: [], entities: {}, authenticationMode: 'unexpected' } },
    { softwareKeys: { ids: [], entities: {}, platformUnlock: {} } },
    { softwareKeys: { ids: ['wallet', 'wallet'], entities: {} } },
    {
      softwareKeys: {
        ids: ['wallet'],
        entities: {
          wallet: { type: 'software', id: 'another-wallet', encryptedSecretKey: 'ciphertext' },
        },
      },
    },
    {
      softwareKeys: {
        ids: [],
        entities: {
          wallet: { type: 'software', id: 'wallet', encryptedSecretKey: 'ciphertext' },
        },
      },
    },
    {
      softwareKeys: {
        ids: ['wallet'],
        entities: {
          wallet: { type: 'software', id: 'wallet', encryptedSecretKey: 'ciphertext' },
          orphan: { type: 'software', id: 'orphan', encryptedSecretKey: 'orphan-ciphertext' },
        },
      },
    },
  ])('rejects malformed persisted state %#', async root => {
    await chrome.storage.local.set({ 'persist:root': root });

    await expect(readPersistedSoftwareKeyState()).resolves.toEqual({ status: 'invalid' });
  });

  test('returns a validated authentication snapshot', async () => {
    await chrome.storage.local.set({
      'persist:root': {
        softwareKeys: {
          authenticationMode: 'password',
          ids: ['wallet'],
          entities: {
            wallet: { type: 'software', id: 'wallet', encryptedSecretKey: 'ciphertext' },
          },
          platformUnlock,
          salt: 'salt',
        },
      },
    });

    await expect(readPersistedSoftwareKeyState()).resolves.toEqual({
      status: 'valid',
      value: {
        authenticationMode: 'password',
        keys: [{ type: 'software', id: 'wallet', encryptedSecretKey: 'ciphertext' }],
        platformUnlock,
        salt: 'salt',
      },
    });
  });
});
