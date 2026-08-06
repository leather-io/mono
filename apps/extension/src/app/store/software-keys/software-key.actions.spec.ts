import { base64urlnopad } from '@scure/base';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  getBnsV2ApiClient,
  getHiroStacksApiClient,
  getLeatherApiClient,
} from '@leather.io/services';
import { keychainAdapter } from '@leather.io/state/keychains';
import {
  type WalletStore,
  fingerprintMigration,
  userAddsWallet,
  userRemovesWallet,
  walletAdapter,
} from '@leather.io/state/wallet';

import { deriveEncryptionKey } from '@shared/crypto/generate-encryption-key';
import {
  decryptMnemonic,
  encryptMnemonic,
  encryptMnemonicWithEncryptionKey,
} from '@shared/crypto/mnemonic-encryption';
import type { PlatformUnlockConfig } from '@shared/crypto/platform-unlock';
import { assumedZeroFingerprint } from '@shared/utils';

import { recurseAccountsForActivity } from '@app/common/account-restoration/account-restore';
import { authenticateWithPassword } from '@app/common/wallet-authentication/use-wallet-authentication';
import { persistor } from '@app/store';
import { initializeWalletSessionWithSoftwareKeys } from '@app/store/session-restore';
import { hydrateSlicesFromStorage } from '@app/store/utils/storage-sync';

import { accountsAdapter } from '../accounts/accounts.slice';
import { getNativeSegwitMainnetAddressFromRootKeychain } from '../accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { getTaprootMainnetAddressFromRootKeychain } from '../accounts/blockchain/bitcoin/taproot-account.hooks';
import { getStacksAddressByIndex } from '../accounts/blockchain/stacks/stacks-keychain';
import { stxChainSlice } from '../chains/stx-chain.slice';
import * as inMemoryStore from '../in-memory-key/in-memory-storage';
import { keyActions } from './software-key.actions';
import { type WalletAuthenticationMode, keyAdapter, keySlice } from './software-key.slice';
import { decryptAllSoftwareKeys } from './utils';

vi.mock('@app/store', () => ({
  persistor: { flush: vi.fn(() => Promise.resolve()) },
  store: { getState: vi.fn(), dispatch: vi.fn() },
}));

vi.mock('@app/store/session-restore', () => ({
  getWalletSessionKey: vi.fn(() => Promise.resolve({ success: false })),
  initializeWalletSessionWithSoftwareKeys: vi.fn(() => Promise.resolve()),
  initalizeWalletSession: vi.fn(() => Promise.resolve()),
}));

vi.mock('@app/common/wallet-authentication/use-wallet-authentication', () => ({
  authenticateWithPassword: vi.fn(),
}));

vi.mock('@app/common/account-restoration/account-restore', () => ({
  recurseAccountsForActivity: vi.fn(() => Promise.resolve(0)),
}));

vi.mock('@app/common/initial-search-params', () => ({
  initialSearchParams: new URLSearchParams(),
}));

vi.mock('@shared/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

vi.mock('@shared/messages', () => ({
  broadcastWalletListChanged: vi.fn(),
  broadcastReplayAction: vi.fn(),
}));

vi.mock('@shared/utils/analytics', () => ({
  identifyUser: vi.fn(),
}));

vi.mock('@shared/crypto/mnemonic-encryption', () => ({
  decryptMnemonic: vi.fn(),
  encryptMnemonic: vi.fn(),
  encryptMnemonicWithEncryptionKey: vi.fn(),
}));

vi.mock('@shared/crypto/generate-encryption-key', () => ({
  deriveEncryptionKey: vi.fn(),
}));

vi.mock('@leather.io/crypto', async importOriginal => {
  const actual = await importOriginal<typeof import('@leather.io/crypto')>();
  return {
    ...actual,
    deriveRootKeychainFromMnemonicSync: vi.fn(() => ({ publicKey: new Uint8Array([1, 2, 3]) })),
  };
});

vi.mock('@leather.io/services', () => ({
  getLeatherApiClient: vi.fn(),
  getHiroStacksApiClient: vi.fn(),
  getBnsV2ApiClient: vi.fn(),
}));

vi.mock('./utils', () => ({
  checkPassword: vi.fn(),
  decryptAllSoftwareKeys: vi.fn(),
}));

vi.mock('../accounts/blockchain/bitcoin/native-segwit-account.hooks', () => ({
  getNativeSegwitMainnetAddressFromRootKeychain: vi.fn(),
}));

vi.mock('../accounts/blockchain/bitcoin/taproot-account.hooks', () => ({
  getTaprootMainnetAddressFromRootKeychain: vi.fn(),
}));

vi.mock('../accounts/blockchain/stacks/stacks-keychain', () => ({
  getStacksAddressByIndex: vi.fn(),
}));

vi.mock('../in-memory-key/in-memory-storage', () => ({
  setKey: vi.fn(),
  getKey: vi.fn(),
  hasKey: vi.fn(),
  removeKey: vi.fn(),
  clearAll: vi.fn(),
  subscribe: vi.fn(),
  getSnapshot: vi.fn(),
}));

interface SoftwareKey {
  type: 'software';
  id: string;
  encryptedSecretKey: string;
}

function buildState({
  authenticationMode,
  salt,
  keys,
  platformUnlock,
  wallets,
  stxChain,
}: {
  authenticationMode?: WalletAuthenticationMode;
  salt: string | undefined;
  keys: SoftwareKey[];
  platformUnlock?: PlatformUnlockConfig;
  wallets?: WalletStore[];
  stxChain?: Record<
    string,
    { highestAccountIndex: number; currentAccountStacksDescriptor: string }
  >;
}) {
  const persistedWallets =
    wallets ??
    keys.map(
      (key, index): WalletStore => ({
        createdOn: '2026-08-06T00:00:00.000Z',
        fingerprint: key.id,
        name: `Wallet ${index + 1}`,
        type: 'software',
      })
    );
  const persistedStxChain =
    stxChain ??
    persistedWallets.reduce<
      Record<string, { highestAccountIndex: number; currentAccountStacksDescriptor: string }>
    >(
      (state, wallet) => ({
        ...state,
        [wallet.fingerprint]: { highestAccountIndex: 0, currentAccountStacksDescriptor: '' },
      }),
      {}
    );
  const activeWallet = persistedWallets[persistedWallets.length - 1];
  return {
    accounts: accountsAdapter.addMany(
      accountsAdapter.getInitialState(),
      persistedWallets.map(wallet => ({ id: `${wallet.fingerprint}/0` }))
    ),
    active: {
      account: activeWallet ? { fingerprint: activeWallet.fingerprint, accountIndex: 0 } : null,
      activePolicyId: null,
    },
    keychains: keychainAdapter.getInitialState(),
    softwareKeys: {
      ...keyAdapter.addMany(keyAdapter.getInitialState(), keys),
      authenticationMode,
      platformUnlock,
      salt,
    },
    wallets: walletAdapter.addMany(walletAdapter.getInitialState(), persistedWallets),
    chains: { stx: persistedStxChain },
  };
}

async function persistState(state: ReturnType<typeof buildState>) {
  await chrome.storage.local.set({ 'persist:root': state });
}

function persistStateOnNextFlush(state: ReturnType<typeof buildState>) {
  vi.mocked(persistor.flush).mockImplementationOnce(async () => {
    await persistState(state);
  });
}

const password = 'correct-horse-battery-staple';
const realFingerprint = 'abcd1234';
const walletCreatedOn = '2026-08-06T00:00:00.000Z';
const reEncryptType = keySlice.actions.softwareKeyReEncrypted.type;
const platformUnlock: PlatformUnlockConfig = {
  credentialId: base64urlnopad.encode(new Uint8Array([1, 2, 3])),
  iv: base64urlnopad.encode(new Uint8Array(12).fill(4)),
  prfInput: base64urlnopad.encode(new Uint8Array(32).fill(5)),
  registrationTag: 'ABC234',
  version: 1,
  wrappedEncryptionKey: base64urlnopad.encode(new Uint8Array(112).fill(6)),
};

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('password wallet creation transaction', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(walletCreatedOn);
    vi.mocked(persistor.flush).mockResolvedValue(undefined);
    await chrome.storage.local.clear();
  });

  test('locks a clean first-wallet write and initializes only from its durable key', async () => {
    const lockRequest = vi.fn(async (_name: string, operation: () => Promise<void>) => operation());
    vi.stubGlobal('navigator', { locks: { request: lockRequest } });
    const persistedState = buildState({
      authenticationMode: 'password',
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'ciphertext' }],
      salt: 'salt',
    });
    persistStateOnNextFlush(persistedState);
    vi.mocked(encryptMnemonic).mockResolvedValue({
      encryptedSecretKey: 'ciphertext',
      encryptionKey: 'ab'.repeat(48),
      salt: 'salt',
    });
    vi.mocked(decryptAllSoftwareKeys).mockResolvedValue([
      { fingerprint: realFingerprint, secretKey: 'mnemonic' },
    ]);

    try {
      await keyActions.setWalletEncryptionPassword({
        password,
        fingerprint: realFingerprint,
        mnemonic: 'mnemonic',
        leatherApiClient: getLeatherApiClient(),
        hiroClient: getHiroStacksApiClient(),
        bnsClient: getBnsV2ApiClient(),
      })(vi.fn(), vi.fn(), undefined);
    } finally {
      vi.unstubAllGlobals();
    }

    expect(lockRequest).toHaveBeenCalledWith(
      'leather:wallet-authentication-write',
      expect.any(Function)
    );
    expect(initializeWalletSessionWithSoftwareKeys).toHaveBeenCalledWith('ab'.repeat(48), [
      { fingerprint: realFingerprint, secretKey: 'mnemonic' },
    ]);
  });

  test('chooses add-wallet from persisted state even when the calling frame is stale', async () => {
    const existingKey: SoftwareKey = {
      type: 'software',
      id: 'existing-wallet',
      encryptedSecretKey: 'existing-ciphertext',
    };
    const existingState = buildState({
      authenticationMode: 'password',
      keys: [existingKey],
      salt: 'salt',
    });
    const newKey: SoftwareKey = {
      type: 'software',
      id: realFingerprint,
      encryptedSecretKey: 'new-ciphertext',
    };
    await persistState(existingState);
    persistStateOnNextFlush(
      buildState({
        authenticationMode: 'password',
        keys: [existingKey, newKey],
        salt: 'salt',
      })
    );
    vi.mocked(authenticateWithPassword).mockResolvedValue({
      status: 'success',
      value: 'ab'.repeat(48),
    });
    vi.mocked(encryptMnemonic).mockResolvedValue({
      encryptedSecretKey: 'new-ciphertext',
      encryptionKey: 'ab'.repeat(48),
      salt: 'salt',
    });
    vi.mocked(decryptAllSoftwareKeys).mockResolvedValue([
      { fingerprint: 'existing-wallet', secretKey: 'existing mnemonic' },
      { fingerprint: realFingerprint, secretKey: 'new mnemonic' },
    ]);
    const dispatch = vi.fn();

    await keyActions.setWalletEncryptionPassword({
      password,
      fingerprint: realFingerprint,
      mnemonic: 'new mnemonic',
      leatherApiClient: getLeatherApiClient(),
      hiroClient: getHiroStacksApiClient(),
      bnsClient: getBnsV2ApiClient(),
    })(dispatch, vi.fn().mockReturnValue(buildState({ keys: [], salt: undefined })), undefined);

    expect(dispatch).toHaveBeenCalledWith(keySlice.actions.addNewWallet(newKey));
    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: keySlice.actions.createSoftwareWalletComplete.type })
    );
  });

  test('rejects non-clean no-key authentication metadata before writing wallet state', async () => {
    await persistState(
      buildState({
        authenticationMode: 'biometric-only',
        keys: [],
        platformUnlock,
        salt: undefined,
      })
    );

    await expect(
      keyActions.setWalletEncryptionPassword({
        password,
        fingerprint: realFingerprint,
        mnemonic: 'mnemonic',
        leatherApiClient: getLeatherApiClient(),
        hiroClient: getHiroStacksApiClient(),
        bnsClient: getBnsV2ApiClient(),
      })(vi.fn(), vi.fn(), undefined)
    ).rejects.toThrow("Can't authenticate this wallet with a password");

    expect(encryptMnemonic).not.toHaveBeenCalled();
    expect(initializeWalletSessionWithSoftwareKeys).not.toHaveBeenCalled();
  });

  test('does not initialize a session when durable read-back omits the new key', async () => {
    persistStateOnNextFlush(buildState({ keys: [], salt: undefined }));
    vi.mocked(encryptMnemonic).mockResolvedValue({
      encryptedSecretKey: 'ciphertext',
      encryptionKey: 'ab'.repeat(48),
      salt: 'salt',
    });

    await expect(
      keyActions.setWalletEncryptionPassword({
        password,
        fingerprint: realFingerprint,
        mnemonic: 'mnemonic',
        leatherApiClient: getLeatherApiClient(),
        hiroClient: getHiroStacksApiClient(),
        bnsClient: getBnsV2ApiClient(),
      })(vi.fn(), vi.fn(), undefined)
    ).rejects.toThrow('Software wallet did not persist under the authenticated key');

    expect(decryptAllSoftwareKeys).not.toHaveBeenCalled();
    expect(initializeWalletSessionWithSoftwareKeys).not.toHaveBeenCalled();
  });

  test('does not initialize a session when durable read-back omits wallet metadata', async () => {
    const persistedState = buildState({
      authenticationMode: 'password',
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'ciphertext' }],
      salt: 'salt',
    });
    persistStateOnNextFlush({
      ...persistedState,
      wallets: walletAdapter.getInitialState(),
    });
    vi.mocked(encryptMnemonic).mockResolvedValue({
      encryptedSecretKey: 'ciphertext',
      encryptionKey: 'ab'.repeat(48),
      salt: 'salt',
    });

    await expect(
      keyActions.setWalletEncryptionPassword({
        password,
        fingerprint: realFingerprint,
        mnemonic: 'mnemonic',
        leatherApiClient: getLeatherApiClient(),
        hiroClient: getHiroStacksApiClient(),
        bnsClient: getBnsV2ApiClient(),
      })(vi.fn(), vi.fn(), undefined)
    ).rejects.toThrow('Software wallet did not persist under the authenticated key');

    expect(initializeWalletSessionWithSoftwareKeys).not.toHaveBeenCalled();
  });
});

describe('unlockWalletAction', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await chrome.storage.local.clear();
  });

  test('current Argon2 wallet decrypts with the stored salt without re-encrypting', async () => {
    const state = buildState({
      salt: 'argon2-salt',
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'enc-current' }],
    });
    await persistState(state);

    vi.mocked(deriveEncryptionKey).mockResolvedValue('encryption-key-current');
    vi.mocked(decryptAllSoftwareKeys).mockResolvedValue([
      { fingerprint: realFingerprint, secretKey: 'decrypted-mnemonic' },
    ]);

    const dispatch = vi.fn();
    const getState = vi.fn();
    getState.mockReturnValue(state);

    await keyActions.unlockWalletAction(password)(dispatch, getState, undefined);

    expect(deriveEncryptionKey).toHaveBeenCalledWith({
      password,
      salt: 'argon2-salt',
    });
    expect(decryptAllSoftwareKeys).toHaveBeenCalledWith(
      [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'enc-current' }],
      'encryption-key-current'
    );

    // The salt already exists, so nothing is re-encrypted or re-persisted.
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: reEncryptType }));
    expect(persistor.flush).not.toHaveBeenCalled();

    expect(initializeWalletSessionWithSoftwareKeys).toHaveBeenCalledWith('encryption-key-current', [
      { fingerprint: realFingerprint, secretKey: 'decrypted-mnemonic' },
    ]);
  });

  test('pre-Argon2 wallet persists the freshly re-encrypted key and its new salt', async () => {
    const state = buildState({
      salt: undefined,
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'enc-legacy' }],
    });
    await persistState(state);
    persistStateOnNextFlush(
      buildState({
        authenticationMode: 'password',
        salt: 'fresh-argon2-salt',
        keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'enc-reencrypted' }],
      })
    );

    // No stored salt means decryptMnemonic took its legacy path: decrypted with the
    // raw password, then re-encrypted under a freshly generated Argon2 salt.
    vi.mocked(decryptMnemonic).mockResolvedValue({
      secretKey: 'decrypted-mnemonic',
      encryptedSecretKey: 'enc-reencrypted',
      salt: 'fresh-argon2-salt',
      encryptionKey: 'encryption-key-legacy',
      fingerprint: realFingerprint,
    });

    const dispatch = vi.fn();
    const getState = vi.fn();
    getState.mockReturnValue(state);

    await keyActions.unlockWalletAction(password)(dispatch, getState, undefined);

    expect(decryptMnemonic).toHaveBeenCalledWith({
      password,
      encryptedSecretKey: 'enc-legacy',
      salt: undefined,
    });

    expect(dispatch).toHaveBeenCalledWith(
      keySlice.actions.softwareKeyReEncrypted({
        salt: 'fresh-argon2-salt',
        key: { type: 'software', id: realFingerprint, encryptedSecretKey: 'enc-reencrypted' },
      })
    );
    expect(persistor.flush).toHaveBeenCalled();

    expect(initializeWalletSessionWithSoftwareKeys).toHaveBeenCalledWith('encryption-key-legacy', [
      {
        secretKey: 'decrypted-mnemonic',
        encryptedSecretKey: 'enc-reencrypted',
        salt: 'fresh-argon2-salt',
        encryptionKey: 'encryption-key-legacy',
        fingerprint: realFingerprint,
      },
    ]);
  });

  test('pre-Argon2 assumed-zero wallet migrates the fingerprint and re-keys the persisted entry', async () => {
    const oldWallet: WalletStore = {
      fingerprint: assumedZeroFingerprint,
      createdOn: '2021-01-01T00:00:00.000Z',
      name: 'My Wallet',
      type: 'software',
    };

    const state = buildState({
      salt: undefined,
      keys: [{ type: 'software', id: assumedZeroFingerprint, encryptedSecretKey: 'enc-legacy' }],
      wallets: [oldWallet],
    });
    await persistState(state);
    persistStateOnNextFlush(
      buildState({
        authenticationMode: 'password',
        salt: 'fresh-argon2-salt',
        keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'enc-reencrypted' }],
        wallets: [{ ...oldWallet, fingerprint: realFingerprint }],
      })
    );

    vi.mocked(decryptMnemonic).mockResolvedValue({
      secretKey: 'decrypted-mnemonic',
      encryptedSecretKey: 'enc-reencrypted',
      salt: 'fresh-argon2-salt',
      encryptionKey: 'encryption-key-legacy',
      fingerprint: realFingerprint,
    });

    const dispatch = vi.fn();
    const getState = vi.fn();
    getState.mockReturnValue(state);

    await keyActions.unlockWalletAction(password)(dispatch, getState, undefined);

    expect(dispatch).toHaveBeenCalledWith(fingerprintMigration(realFingerprint));
    expect(dispatch).toHaveBeenCalledWith(
      userRemovesWallet({ fingerprint: assumedZeroFingerprint })
    );
    expect(dispatch).toHaveBeenCalledWith(
      userAddsWallet({
        wallet: { ...oldWallet, fingerprint: realFingerprint },
        accountKeychains: [],
      })
    );

    // The re-encrypted key is persisted under the migrated (real) fingerprint.
    expect(dispatch).toHaveBeenCalledWith(
      keySlice.actions.softwareKeyReEncrypted({
        salt: 'fresh-argon2-salt',
        key: { type: 'software', id: realFingerprint, encryptedSecretKey: 'enc-reencrypted' },
      })
    );
  });

  test('does not initialize session state when any current wallet rejects the key', async () => {
    const state = buildState({
      salt: 'argon2-salt',
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'enc-current' }],
    });
    await persistState(state);
    vi.mocked(deriveEncryptionKey).mockResolvedValue('wrong-key');
    vi.mocked(decryptAllSoftwareKeys).mockRejectedValue(new Error('authentication failed'));

    await expect(
      keyActions.unlockWalletAction(password)(vi.fn(), vi.fn().mockReturnValue(state), undefined)
    ).rejects.toThrow('authentication failed');

    expect(initializeWalletSessionWithSoftwareKeys).not.toHaveBeenCalled();
  });

  test('rejects a key when software-wallet state changes during validation', async () => {
    const state = buildState({
      salt: 'argon2-salt',
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'enc-current' }],
    });
    const changedState = buildState({
      salt: 'argon2-salt',
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'enc-changed' }],
    });
    await persistState(state);
    const getState = vi
      .fn()
      .mockReturnValueOnce(state)
      .mockReturnValueOnce(state)
      .mockReturnValue(changedState);
    vi.mocked(deriveEncryptionKey).mockResolvedValue('encryption-key-current');
    vi.mocked(decryptAllSoftwareKeys).mockImplementation(async () => {
      await persistState(changedState);
      return [{ fingerprint: realFingerprint, secretKey: 'decrypted-mnemonic' }];
    });

    await expect(
      keyActions.unlockWalletAction(password)(vi.fn(), getState, undefined)
    ).rejects.toThrow('Software wallet state changed during authentication');

    expect(initializeWalletSessionWithSoftwareKeys).not.toHaveBeenCalled();
  });

  test('repairs a stale frame by deriving from the authoritative persisted password state', async () => {
    const localState = buildState({
      authenticationMode: 'biometric-only',
      salt: undefined,
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'old-ciphertext' }],
      platformUnlock,
    });
    const persistedState = buildState({
      authenticationMode: 'password',
      salt: 'new-salt',
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'new-ciphertext' }],
      platformUnlock,
    });
    const decrypted = [{ fingerprint: realFingerprint, secretKey: 'decrypted-mnemonic' }];
    await chrome.storage.local.set({ 'persist:root': persistedState });
    vi.mocked(deriveEncryptionKey).mockResolvedValue('new-encryption-key');
    vi.mocked(decryptAllSoftwareKeys).mockResolvedValue(decrypted);

    await keyActions.unlockWalletAction(password)(
      vi.fn(),
      vi.fn().mockReturnValue(localState),
      undefined
    );

    expect(deriveEncryptionKey).toHaveBeenCalledWith({ password, salt: 'new-salt' });
    expect(decryptAllSoftwareKeys).toHaveBeenCalledWith(
      [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'new-ciphertext' }],
      'new-encryption-key'
    );
    expect(initializeWalletSessionWithSoftwareKeys).toHaveBeenCalledWith(
      'new-encryption-key',
      decrypted
    );
  });
});

describe('authenticated encryption-key actions', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(walletCreatedOn);
    vi.mocked(persistor.flush).mockResolvedValue(undefined);
    await chrome.storage.local.clear();
  });

  test('unlocks biometric-only state without requiring a password salt', async () => {
    const state = buildState({
      authenticationMode: 'biometric-only',
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'enc-current' }],
      platformUnlock,
      salt: undefined,
    });
    await persistState(state);
    const decrypted = [{ fingerprint: realFingerprint, secretKey: 'decrypted-mnemonic' }];
    vi.mocked(decryptAllSoftwareKeys).mockResolvedValue(decrypted);

    await keyActions.unlockWalletWithEncryptionKey({ encryptionKey: 'ab'.repeat(48) })(
      vi.fn(),
      vi.fn().mockReturnValue(state),
      undefined
    );

    expect(initializeWalletSessionWithSoftwareKeys).toHaveBeenCalledWith(
      'ab'.repeat(48),
      decrypted
    );
  });

  test('rejects a stale biometric proof after another frame replaces authentication state', async () => {
    const localState = buildState({
      authenticationMode: 'biometric-only',
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'old-ciphertext' }],
      platformUnlock,
      salt: undefined,
    });
    const replacementPlatformUnlock: PlatformUnlockConfig = {
      ...platformUnlock,
      iv: base64urlnopad.encode(new Uint8Array(12).fill(9)),
    };
    const persistedState = buildState({
      authenticationMode: 'password',
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'new-ciphertext' }],
      platformUnlock: replacementPlatformUnlock,
      salt: 'new-salt',
    });
    await chrome.storage.local.set({ 'persist:root': persistedState });

    await expect(
      keyActions.unlockWalletWithEncryptionKey({
        encryptionKey: 'ab'.repeat(48),
        expectedPlatformUnlock: platformUnlock,
      })(vi.fn(), vi.fn().mockReturnValue(localState), undefined)
    ).rejects.toThrow('Platform authentication state changed during authentication');

    expect(decryptAllSoftwareKeys).not.toHaveBeenCalled();
    expect(initializeWalletSessionWithSoftwareKeys).not.toHaveBeenCalled();
  });

  test('validates stale-frame password proof against authoritative persisted wallets', async () => {
    const localState = buildState({
      authenticationMode: 'password',
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'old-ciphertext' }],
      platformUnlock,
      salt: 'old-salt',
    });
    const persistedState = buildState({
      authenticationMode: 'password',
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'new-ciphertext' }],
      platformUnlock,
      salt: 'new-salt',
    });
    await chrome.storage.local.set({ 'persist:root': persistedState });
    vi.mocked(authenticateWithPassword).mockResolvedValue({
      status: 'failure',
      code: 'invalid-password',
    });

    await expect(
      keyActions.addSoftwareWalletWithPassword({
        password: 'old password',
        fingerprint: 'new-wallet',
        mnemonic: 'new mnemonic',
        leatherApiClient: getLeatherApiClient(),
        hiroClient: getHiroStacksApiClient(),
        bnsClient: getBnsV2ApiClient(),
      })(vi.fn(), vi.fn().mockReturnValue(localState), undefined)
    ).rejects.toThrow("The password doesn't match");

    expect(authenticateWithPassword).toHaveBeenCalledWith({
      password: 'old password',
      salt: 'new-salt',
      softwareKeys: [
        { type: 'software', id: realFingerprint, encryptedSecretKey: 'new-ciphertext' },
      ],
    });
    expect(initializeWalletSessionWithSoftwareKeys).not.toHaveBeenCalled();
  });

  test('adds a wallet under a validated key without changing authentication mode', async () => {
    const state = buildState({
      authenticationMode: 'biometric-only',
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'enc-current' }],
      platformUnlock,
      salt: undefined,
    });
    const persistedState = buildState({
      authenticationMode: 'biometric-only',
      keys: [
        { type: 'software', id: realFingerprint, encryptedSecretKey: 'enc-current' },
        { type: 'software', id: 'new-wallet', encryptedSecretKey: 'new-ciphertext' },
      ],
      platformUnlock,
      salt: undefined,
    });
    await persistState(state);
    persistStateOnNextFlush(persistedState);
    const dispatch = vi.fn();
    vi.mocked(decryptAllSoftwareKeys)
      .mockResolvedValueOnce([{ fingerprint: realFingerprint, secretKey: 'existing-mnemonic' }])
      .mockResolvedValueOnce([
        { fingerprint: realFingerprint, secretKey: 'existing-mnemonic' },
        { fingerprint: 'new-wallet', secretKey: 'new mnemonic' },
      ]);
    vi.mocked(encryptMnemonicWithEncryptionKey).mockResolvedValue({
      encryptedSecretKey: 'new-ciphertext',
    });
    const getState = vi
      .fn()
      .mockReturnValueOnce(state)
      .mockReturnValueOnce(state)
      .mockReturnValue(persistedState);

    await keyActions.addSoftwareWalletWithEncryptionKey({
      encryptionKey: 'ab'.repeat(48),
      fingerprint: 'new-wallet',
      mnemonic: 'new mnemonic',
      leatherApiClient: getLeatherApiClient(),
      hiroClient: getHiroStacksApiClient(),
      bnsClient: getBnsV2ApiClient(),
    })(dispatch, getState, undefined);

    expect(dispatch).toHaveBeenCalledWith(
      keySlice.actions.addNewWallet({
        type: 'software',
        id: 'new-wallet',
        encryptedSecretKey: 'new-ciphertext',
      })
    );
    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: keySlice.actions.createSoftwareWalletComplete.type })
    );
    expect(initializeWalletSessionWithSoftwareKeys).toHaveBeenCalledWith('ab'.repeat(48), [
      { fingerprint: realFingerprint, secretKey: 'existing-mnemonic' },
      { fingerprint: 'new-wallet', secretKey: 'new mnemonic' },
    ]);
  });

  test('restores authoritative wallet state when biometric wallet persistence fails', async () => {
    const state = buildState({
      authenticationMode: 'biometric-only',
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'enc-current' }],
      platformUnlock,
      salt: undefined,
    });
    await persistState(state);
    vi.mocked(decryptAllSoftwareKeys).mockResolvedValue([
      { fingerprint: realFingerprint, secretKey: 'existing-mnemonic' },
    ]);
    vi.mocked(encryptMnemonicWithEncryptionKey).mockResolvedValue({
      encryptedSecretKey: 'new-ciphertext',
    });
    vi.mocked(persistor.flush)
      .mockRejectedValueOnce(new Error('forced persistence failure'))
      .mockResolvedValueOnce(undefined);
    const dispatch = vi.fn();

    await expect(
      keyActions.addSoftwareWalletWithEncryptionKey({
        encryptionKey: 'ab'.repeat(48),
        expectedPlatformUnlock: platformUnlock,
        fingerprint: 'new-wallet',
        mnemonic: 'new mnemonic',
        leatherApiClient: getLeatherApiClient(),
        hiroClient: getHiroStacksApiClient(),
        bnsClient: getBnsV2ApiClient(),
      })(dispatch, vi.fn().mockReturnValue(state), undefined)
    ).rejects.toThrow('forced persistence failure');

    expect(dispatch).not.toHaveBeenCalledWith(userRemovesWallet({ fingerprint: 'new-wallet' }));
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: hydrateSlicesFromStorage.type,
        payload: expect.objectContaining({
          accounts: state.accounts,
          active: state.active,
          chains: state.chains,
          keychains: state.keychains,
          wallets: state.wallets,
        }),
      })
    );
    expect(persistor.flush).toHaveBeenCalledTimes(2);
    expect(initializeWalletSessionWithSoftwareKeys).not.toHaveBeenCalled();
  });

  test('commits a complete biometric-only to password transition before replacing session state', async () => {
    const sourceKey: SoftwareKey = {
      type: 'software',
      id: realFingerprint,
      encryptedSecretKey: 'old-ciphertext',
    };
    const replacementKey = { ...sourceKey, encryptedSecretKey: 'new-ciphertext' };
    const replacementPlatformUnlock: PlatformUnlockConfig = {
      ...platformUnlock,
      iv: base64urlnopad.encode(new Uint8Array(12).fill(9)),
    };
    const currentState = buildState({
      authenticationMode: 'biometric-only',
      keys: [sourceKey],
      platformUnlock,
      salt: undefined,
    });
    const persistedState = buildState({
      authenticationMode: 'password',
      keys: [replacementKey],
      platformUnlock: replacementPlatformUnlock,
      salt: 'new-salt',
    });
    await persistState(currentState);
    persistStateOnNextFlush(persistedState);
    const getState = vi.fn().mockReturnValueOnce(currentState).mockReturnValue(persistedState);
    const decrypted = [{ fingerprint: realFingerprint, secretKey: 'mnemonic' }];
    vi.mocked(decryptAllSoftwareKeys).mockResolvedValue(decrypted);
    const dispatch = vi.fn();

    await keyActions.commitBiometricOnlyToPasswordTransition({
      encryptionKey: 'cd'.repeat(48),
      keys: [replacementKey],
      platformUnlock: replacementPlatformUnlock,
      salt: 'new-salt',
      sourceKeys: [sourceKey],
      sourcePlatformUnlock: platformUnlock,
    })(dispatch, getState, undefined);

    expect(dispatch).toHaveBeenCalledWith(
      keySlice.actions.biometricOnlyToPasswordTransitionComplete({
        keys: [replacementKey],
        platformUnlock: replacementPlatformUnlock,
        salt: 'new-salt',
      })
    );
    expect(persistor.flush).toHaveBeenCalledTimes(1);
    expect(initializeWalletSessionWithSoftwareKeys).toHaveBeenCalledWith(
      'cd'.repeat(48),
      decrypted
    );
    expect(vi.mocked(persistor.flush).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(initializeWalletSessionWithSoftwareKeys).mock.invocationCallOrder[0]
    );
  });

  test('does not replace session state when the password transition flush fails', async () => {
    const sourceKey: SoftwareKey = {
      type: 'software',
      id: realFingerprint,
      encryptedSecretKey: 'old-ciphertext',
    };
    const replacementKey = { ...sourceKey, encryptedSecretKey: 'new-ciphertext' };
    const replacementPlatformUnlock: PlatformUnlockConfig = {
      ...platformUnlock,
      iv: base64urlnopad.encode(new Uint8Array(12).fill(9)),
    };
    const currentState = buildState({
      authenticationMode: 'biometric-only',
      keys: [sourceKey],
      platformUnlock,
      salt: undefined,
    });
    await persistState(currentState);
    vi.mocked(persistor.flush).mockRejectedValue(new Error('forced persistence failure'));
    const dispatch = vi.fn();

    await expect(
      keyActions.commitBiometricOnlyToPasswordTransition({
        encryptionKey: 'cd'.repeat(48),
        keys: [replacementKey],
        platformUnlock: replacementPlatformUnlock,
        salt: 'new-salt',
        sourceKeys: [sourceKey],
        sourcePlatformUnlock: platformUnlock,
      })(dispatch, vi.fn().mockReturnValue(currentState), undefined)
    ).rejects.toThrow('forced persistence failure');

    expect(vi.mocked(persistor.flush)).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenCalledWith(
      keySlice.actions.biometricOnlyToPasswordTransitionRolledBack({
        keys: [sourceKey],
        platformUnlock,
      })
    );
    expect(vi.mocked(initializeWalletSessionWithSoftwareKeys)).not.toHaveBeenCalled();
  });

  test('restores empty authoritative state when biometric persistence fails', async () => {
    const preparedKey: SoftwareKey = {
      type: 'software',
      id: realFingerprint,
      encryptedSecretKey: 'biometric-ciphertext',
    };
    const state = buildState({ keys: [], salt: undefined });
    vi.mocked(decryptAllSoftwareKeys).mockResolvedValue([
      { fingerprint: realFingerprint, secretKey: 'mnemonic' },
    ]);
    vi.mocked(persistor.flush)
      .mockRejectedValueOnce(new Error('forced persistence failure'))
      .mockResolvedValueOnce(undefined);
    const dispatch = vi.fn();

    await expect(
      keyActions.createBiometricSoftwareWallet({
        fingerprint: realFingerprint,
        mnemonic: 'mnemonic',
        preparation: {
          encryptionKey: 'ab'.repeat(48),
          key: preparedKey,
          platformUnlock,
        },
        leatherApiClient: getLeatherApiClient(),
        hiroClient: getHiroStacksApiClient(),
        bnsClient: getBnsV2ApiClient(),
      })(dispatch, vi.fn().mockReturnValue(state), undefined)
    ).rejects.toThrow('forced persistence failure');

    expect(dispatch).not.toHaveBeenCalledWith(userRemovesWallet({ fingerprint: realFingerprint }));
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: hydrateSlicesFromStorage.type,
        payload: expect.objectContaining({
          accounts: state.accounts,
          active: state.active,
          chains: state.chains,
          keychains: state.keychains,
          wallets: state.wallets,
        }),
      })
    );
    expect(initializeWalletSessionWithSoftwareKeys).not.toHaveBeenCalled();
  });

  test('persists a complete biometric unlock replacement after current state validation', async () => {
    const sourceKey: SoftwareKey = {
      type: 'software',
      id: realFingerprint,
      encryptedSecretKey: 'ciphertext',
    };
    const currentState = buildState({
      authenticationMode: 'password',
      keys: [sourceKey],
      salt: 'argon2-salt',
    });
    const replacementPlatformUnlock: PlatformUnlockConfig = {
      ...platformUnlock,
      iv: base64urlnopad.encode(new Uint8Array(12).fill(9)),
    };
    const persistedState = buildState({
      authenticationMode: 'password',
      keys: [sourceKey],
      platformUnlock: replacementPlatformUnlock,
      salt: 'argon2-salt',
    });
    await persistState(currentState);
    persistStateOnNextFlush(persistedState);
    const getState = vi.fn().mockReturnValueOnce(currentState).mockReturnValue(persistedState);
    const dispatch = vi.fn();

    await keyActions.commitPlatformUnlockChange({
      platformUnlock: replacementPlatformUnlock,
      sourceAuthenticationMode: 'password',
      sourceKeys: [sourceKey],
      sourceSalt: 'argon2-salt',
    })(dispatch, getState, undefined);

    expect(dispatch).toHaveBeenCalledWith(
      keySlice.actions.platformUnlockConfigSaved(replacementPlatformUnlock)
    );
    expect(persistor.flush).toHaveBeenCalledTimes(1);
  });

  test('restores the prior config when biometric unlock replacement persistence fails', async () => {
    const sourceKey: SoftwareKey = {
      type: 'software',
      id: realFingerprint,
      encryptedSecretKey: 'ciphertext',
    };
    const currentState = buildState({
      authenticationMode: 'password',
      keys: [sourceKey],
      platformUnlock,
      salt: 'argon2-salt',
    });
    const replacementPlatformUnlock: PlatformUnlockConfig = {
      ...platformUnlock,
      iv: base64urlnopad.encode(new Uint8Array(12).fill(9)),
    };
    await persistState(currentState);
    vi.mocked(persistor.flush)
      .mockRejectedValueOnce(new Error('forced persistence failure'))
      .mockResolvedValueOnce(undefined);
    const dispatch = vi.fn();

    await expect(
      keyActions.commitPlatformUnlockChange({
        platformUnlock: replacementPlatformUnlock,
        sourceAuthenticationMode: 'password',
        sourceKeys: [sourceKey],
        sourcePlatformUnlock: platformUnlock,
        sourceSalt: 'argon2-salt',
      })(dispatch, vi.fn().mockReturnValue(currentState), undefined)
    ).rejects.toThrow('forced persistence failure');

    expect(dispatch).toHaveBeenCalledWith(
      keySlice.actions.platformUnlockConfigSaved(replacementPlatformUnlock)
    );
    expect(dispatch).toHaveBeenCalledWith(
      keySlice.actions.platformUnlockChangeRolledBack({
        authenticationMode: 'password',
        platformUnlock,
      })
    );
    expect(persistor.flush).toHaveBeenCalledTimes(2);
  });

  test('rejects biometric unlock replacement after another frame changes the config', async () => {
    const sourceKey: SoftwareKey = {
      type: 'software',
      id: realFingerprint,
      encryptedSecretKey: 'ciphertext',
    };
    const currentState = buildState({
      authenticationMode: 'password',
      keys: [sourceKey],
      platformUnlock,
      salt: 'argon2-salt',
    });
    const otherPlatformUnlock: PlatformUnlockConfig = {
      ...platformUnlock,
      iv: base64urlnopad.encode(new Uint8Array(12).fill(8)),
    };
    await chrome.storage.local.set({
      'persist:root': buildState({
        authenticationMode: 'password',
        keys: [sourceKey],
        platformUnlock: otherPlatformUnlock,
        salt: 'argon2-salt',
      }),
    });

    await expect(
      keyActions.commitPlatformUnlockChange({
        platformUnlock: {
          ...platformUnlock,
          iv: base64urlnopad.encode(new Uint8Array(12).fill(9)),
        },
        sourceAuthenticationMode: 'password',
        sourceKeys: [sourceKey],
        sourcePlatformUnlock: platformUnlock,
        sourceSalt: 'argon2-salt',
      })(vi.fn(), vi.fn().mockReturnValue(currentState), undefined)
    ).rejects.toThrow('Software wallet state changed during authentication');

    expect(persistor.flush).not.toHaveBeenCalled();
  });

  test('disables biometric unlock only when a password authenticator remains', async () => {
    const sourceKey: SoftwareKey = {
      type: 'software',
      id: realFingerprint,
      encryptedSecretKey: 'ciphertext',
    };
    const currentState = buildState({
      authenticationMode: 'password',
      keys: [sourceKey],
      platformUnlock,
      salt: 'argon2-salt',
    });
    const persistedState = buildState({
      authenticationMode: 'password',
      keys: [sourceKey],
      salt: 'argon2-salt',
    });
    await persistState(currentState);
    persistStateOnNextFlush(persistedState);
    const dispatch = vi.fn();

    await keyActions.disablePlatformUnlock()(
      dispatch,
      vi.fn().mockReturnValueOnce(currentState).mockReturnValue(persistedState),
      undefined
    );

    expect(dispatch).toHaveBeenCalledWith(keySlice.actions.platformUnlockConfigRemoved());
    expect(persistor.flush).toHaveBeenCalledTimes(1);
  });

  test('cannot disable a biometric-only wallet authenticator', async () => {
    const state = buildState({
      authenticationMode: 'biometric-only',
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'ciphertext' }],
      platformUnlock,
      salt: undefined,
    });
    await persistState(state);

    await expect(
      keyActions.disablePlatformUnlock()(vi.fn(), vi.fn().mockReturnValue(state), undefined)
    ).rejects.toThrow("Can't disable the only wallet authenticator");

    expect(persistor.flush).not.toHaveBeenCalled();
  });

  test('persists a prepared first biometric wallet before installing its session', async () => {
    const preparedKey: SoftwareKey = {
      type: 'software',
      id: realFingerprint,
      encryptedSecretKey: 'biometric-ciphertext',
    };
    const currentState = buildState({ keys: [], salt: undefined });
    const persistedState = buildState({
      authenticationMode: 'biometric-only',
      keys: [preparedKey],
      platformUnlock,
      salt: undefined,
    });
    persistStateOnNextFlush(persistedState);
    const decrypted = [{ fingerprint: realFingerprint, secretKey: 'mnemonic' }];
    vi.mocked(decryptAllSoftwareKeys).mockResolvedValue(decrypted);
    const dispatch = vi.fn();

    await keyActions.createBiometricSoftwareWallet({
      fingerprint: realFingerprint,
      mnemonic: 'mnemonic',
      preparation: {
        encryptionKey: 'ab'.repeat(48),
        key: preparedKey,
        platformUnlock,
      },
      leatherApiClient: getLeatherApiClient(),
      hiroClient: getHiroStacksApiClient(),
      bnsClient: getBnsV2ApiClient(),
    })(
      dispatch,
      vi.fn().mockReturnValueOnce(currentState).mockReturnValue(persistedState),
      undefined
    );

    expect(dispatch).toHaveBeenCalledWith(
      keySlice.actions.createBiometricSoftwareWalletComplete({
        key: preparedKey,
        platformUnlock,
      })
    );
    expect(persistor.flush).toHaveBeenCalledTimes(1);
    expect(initializeWalletSessionWithSoftwareKeys).toHaveBeenCalledWith(
      'ab'.repeat(48),
      decrypted
    );
    expect(vi.mocked(persistor.flush).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(initializeWalletSessionWithSoftwareKeys).mock.invocationCallOrder[0]
    );
  });

  test('does not apply a first biometric wallet preparation to existing software state', async () => {
    const state = buildState({
      authenticationMode: 'password',
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'ciphertext' }],
      salt: 'argon2-salt',
    });
    await persistState(state);

    await expect(
      keyActions.createBiometricSoftwareWallet({
        fingerprint: 'new-wallet',
        mnemonic: 'mnemonic',
        preparation: {
          encryptionKey: 'ab'.repeat(48),
          key: { type: 'software', id: 'new-wallet', encryptedSecretKey: 'new-ciphertext' },
          platformUnlock,
        },
        leatherApiClient: getLeatherApiClient(),
        hiroClient: getHiroStacksApiClient(),
        bnsClient: getBnsV2ApiClient(),
      })(vi.fn(), vi.fn().mockReturnValue(state), undefined)
    ).rejects.toThrow('Software wallet state changed during biometric setup');

    expect(persistor.flush).not.toHaveBeenCalled();
  });
});

describe('probeNextAccountAndDiscoverAccounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(inMemoryStore.getKey).mockReturnValue('decrypted-mnemonic');
    vi.mocked(recurseAccountsForActivity).mockImplementation(({ onActivityFound }) => {
      onActivityFound?.(4);
      return Promise.resolve(4);
    });
    vi.mocked(getStacksAddressByIndex).mockImplementation(
      () => (accountIndex: number) => `stx-${accountIndex}`
    );
    vi.mocked(getNativeSegwitMainnetAddressFromRootKeychain).mockImplementation(
      () => (accountIndex: number) => `segwit-${accountIndex}`
    );
    vi.mocked(getTaprootMainnetAddressFromRootKeychain).mockImplementation(
      () => (accountIndex: number) => `taproot-${accountIndex}`
    );
  });

  test('checks the next account index and starts recursive discovery when btc history is found', async () => {
    const state = buildState({
      salt: 'argon2-salt',
      keys: [],
      wallets: [
        { fingerprint: realFingerprint, createdOn: null, name: 'Wallet', type: 'software' },
      ],
      stxChain: {
        [realFingerprint]: {
          highestAccountIndex: 2,
          currentAccountStacksDescriptor: '',
        },
      },
    });
    const hiroClient = {
      getAddressStxBalance: vi.fn().mockResolvedValue({ balance: '0' }),
      getAddressTransactions: vi.fn().mockResolvedValue([]),
    };
    const leatherApiClient = {
      fetchUtxosByAddress: vi.fn().mockResolvedValue([]),
      fetchBitcoinTransactionsByAddress: vi.fn((address: string) =>
        Promise.resolve(
          address === 'taproot-3' ? { data: [{ txid: 'txid' }], meta: {} } : { data: [], meta: {} }
        )
      ),
    };
    const bnsClient = {
      fetchAddressBnsNames: vi.fn().mockResolvedValue({ names: [] }),
    };
    const dispatch = vi.fn();
    const getState = vi.fn().mockReturnValue(state);

    await keyActions.probeNextAccountAndDiscoverAccounts({
      leatherApiClient: leatherApiClient as never,
      hiroClient: hiroClient as never,
      bnsClient: bnsClient as never,
    })(dispatch, getState, undefined);
    await flushPromises();

    expect(hiroClient.getAddressStxBalance).toHaveBeenCalledWith('stx-3', {
      signal: expect.any(AbortSignal),
    });
    expect(leatherApiClient.fetchUtxosByAddress).toHaveBeenCalledWith('segwit-3', {
      signal: expect.any(AbortSignal),
    });
    expect(leatherApiClient.fetchUtxosByAddress).toHaveBeenCalledWith('taproot-3', {
      signal: expect.any(AbortSignal),
    });
    expect(leatherApiClient.fetchBitcoinTransactionsByAddress).toHaveBeenCalledWith(
      'segwit-3',
      { page: 1, pageSize: 1 },
      { signal: expect.any(AbortSignal) }
    );
    expect(leatherApiClient.fetchBitcoinTransactionsByAddress).toHaveBeenCalledWith(
      'taproot-3',
      { page: 1, pageSize: 1 },
      { signal: expect.any(AbortSignal) }
    );
    expect(recurseAccountsForActivity).toHaveBeenCalledTimes(1);
    expect(recurseAccountsForActivity).toHaveBeenCalledWith(
      expect.objectContaining({ fromAccountIndex: 2 })
    );

    const restoreAction = stxChainSlice.actions.restoreAccountIndex({
      fingerprint: realFingerprint,
      accountIndex: 4,
    });
    expect(dispatch).toHaveBeenCalledWith(restoreAction);
    expect(persistor.flush).toHaveBeenCalled();
  });

  test('does not start recursive discovery when the next account has no activity', async () => {
    const state = buildState({
      salt: 'argon2-salt',
      keys: [],
      wallets: [
        { fingerprint: realFingerprint, createdOn: null, name: 'Wallet', type: 'software' },
      ],
      stxChain: {
        [realFingerprint]: {
          highestAccountIndex: 1,
          currentAccountStacksDescriptor: '',
        },
      },
    });
    const hiroClient = {
      getAddressStxBalance: vi.fn().mockResolvedValue({ balance: '0' }),
      getAddressTransactions: vi.fn().mockResolvedValue([]),
    };
    const leatherApiClient = {
      fetchUtxosByAddress: vi.fn().mockResolvedValue([]),
      fetchBitcoinTransactionsByAddress: vi.fn().mockResolvedValue({ data: [], meta: {} }),
    };
    const bnsClient = {
      fetchAddressBnsNames: vi.fn().mockResolvedValue({ names: [] }),
    };
    const dispatch = vi.fn();
    const getState = vi.fn().mockReturnValue(state);

    await keyActions.probeNextAccountAndDiscoverAccounts({
      leatherApiClient: leatherApiClient as never,
      hiroClient: hiroClient as never,
      bnsClient: bnsClient as never,
    })(dispatch, getState, undefined);

    expect(hiroClient.getAddressStxBalance).toHaveBeenCalledWith('stx-2', {
      signal: expect.any(AbortSignal),
    });
    expect(recurseAccountsForActivity).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
