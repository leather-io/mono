import { base64urlnopad } from '@scure/base';

import type { PlatformUnlockConfig } from '@shared/crypto/platform-unlock';

import {
  readPersistedSoftwareKeyState,
  readPersistedWalletTransactionState,
} from './software-key-state';

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
    {
      softwareKeys: {
        ids: ['wallet'],
        entities: {
          wallet: { type: 'software', id: 'wallet', encryptedSecretKey: 'ciphertext' },
        },
        salt: '',
      },
    },
    {
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
    {
      softwareKeys: {
        authenticationMode: 'biometric-only',
        ids: ['wallet'],
        entities: {
          wallet: { type: 'software', id: 'wallet', encryptedSecretKey: 'ciphertext' },
        },
        platformUnlock,
        salt: 'salt',
      },
    },
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

  test('returns a validated password-only authentication snapshot', async () => {
    await chrome.storage.local.set({
      'persist:root': {
        softwareKeys: {
          authenticationMode: 'password',
          ids: ['wallet'],
          entities: {
            wallet: { type: 'software', id: 'wallet', encryptedSecretKey: 'ciphertext' },
          },
          salt: 'salt',
        },
      },
    });

    await expect(readPersistedSoftwareKeyState()).resolves.toEqual({
      status: 'valid',
      value: {
        authenticationMode: 'password',
        keys: [{ type: 'software', id: 'wallet', encryptedSecretKey: 'ciphertext' }],
        platformUnlock: undefined,
        salt: 'salt',
      },
    });
  });

  test('accepts a legacy password snapshot without an explicit authentication mode', async () => {
    await chrome.storage.local.set({
      'persist:root': {
        softwareKeys: {
          ids: ['wallet'],
          entities: {
            wallet: { type: 'software', id: 'wallet', encryptedSecretKey: 'ciphertext' },
          },
          salt: 'salt',
        },
      },
    });

    await expect(readPersistedSoftwareKeyState()).resolves.toEqual({
      status: 'valid',
      value: {
        authenticationMode: undefined,
        keys: [{ type: 'software', id: 'wallet', encryptedSecretKey: 'ciphertext' }],
        platformUnlock: undefined,
        salt: 'salt',
      },
    });
  });

  test('returns a validated biometric-only authentication snapshot', async () => {
    await chrome.storage.local.set({
      'persist:root': {
        softwareKeys: {
          authenticationMode: 'biometric-only',
          ids: ['wallet'],
          entities: {
            wallet: { type: 'software', id: 'wallet', encryptedSecretKey: 'ciphertext' },
          },
          platformUnlock,
        },
      },
    });

    await expect(readPersistedSoftwareKeyState()).resolves.toEqual({
      status: 'valid',
      value: {
        authenticationMode: 'biometric-only',
        keys: [{ type: 'software', id: 'wallet', encryptedSecretKey: 'ciphertext' }],
        platformUnlock,
        salt: undefined,
      },
    });
  });
});

function buildWalletTransactionRoot({
  softwareKeys,
  wallets,
}: {
  softwareKeys: Record<string, unknown>;
  wallets: Record<string, unknown>;
}) {
  return {
    accounts: { ids: [], entities: {} },
    active: { account: null, activePolicyId: null },
    chains: { stx: {} },
    keychains: { ids: [], entities: {} },
    softwareKeys,
    wallets,
  };
}

describe(readPersistedWalletTransactionState.name, () => {
  beforeEach(async () => {
    await chrome.storage.local.clear();
  });

  test('rejects a software wallet without matching encrypted key state', async () => {
    await chrome.storage.local.set({
      'persist:root': buildWalletTransactionRoot({
        softwareKeys: { ids: [], entities: {} },
        wallets: {
          ids: ['wallet'],
          entities: {
            wallet: {
              createdOn: null,
              fingerprint: 'wallet',
              name: 'Wallet 1',
              type: 'software',
            },
          },
        },
      }),
    });

    await expect(readPersistedWalletTransactionState()).resolves.toEqual({ status: 'invalid' });
  });

  test('rejects encrypted key state without a matching software wallet', async () => {
    await chrome.storage.local.set({
      'persist:root': buildWalletTransactionRoot({
        softwareKeys: {
          authenticationMode: 'password',
          ids: ['wallet'],
          entities: {
            wallet: { type: 'software', id: 'wallet', encryptedSecretKey: 'ciphertext' },
          },
          salt: 'salt',
        },
        wallets: { ids: [], entities: {} },
      }),
    });

    await expect(readPersistedWalletTransactionState()).resolves.toEqual({ status: 'invalid' });
  });

  test('rejects wallet entity keys that are absent from the id list', async () => {
    await chrome.storage.local.set({
      'persist:root': buildWalletTransactionRoot({
        softwareKeys: { ids: [], entities: {} },
        wallets: {
          ids: [],
          entities: {
            ledger: {
              createdOn: null,
              fingerprint: 'ledger',
              name: 'Ledger',
              type: 'ledger',
            },
          },
        },
      }),
    });

    await expect(readPersistedWalletTransactionState()).resolves.toEqual({ status: 'invalid' });
  });

  test('accepts a ledger-only wallet transaction state without software keys', async () => {
    await chrome.storage.local.set({
      'persist:root': buildWalletTransactionRoot({
        softwareKeys: { ids: [], entities: {} },
        wallets: {
          ids: ['ledger'],
          entities: {
            ledger: {
              createdOn: null,
              fingerprint: 'ledger',
              name: 'Ledger',
              type: 'ledger',
            },
          },
        },
      }),
    });

    await expect(readPersistedWalletTransactionState()).resolves.toMatchObject({
      status: 'valid',
    });
  });
});
