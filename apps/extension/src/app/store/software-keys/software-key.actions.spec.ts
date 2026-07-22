import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  type WalletStore,
  fingerprintMigration,
  userAddsWallet,
  userRemovesWallet,
  walletAdapter,
} from '@leather.io/state/wallet';

import { decryptMnemonic } from '@shared/crypto/mnemonic-encryption';
import { assumedZeroFingerprint } from '@shared/utils';

import { recurseAccountsForActivity } from '@app/common/account-restoration/account-restore';
import { persistor } from '@app/store';
import { initalizeWalletSession } from '@app/store/session-restore';

import { getNativeSegwitMainnetAddressFromRootKeychain } from '../accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { getTaprootMainnetAddressFromRootKeychain } from '../accounts/blockchain/bitcoin/taproot-account.hooks';
import { getStacksAddressByIndex } from '../accounts/blockchain/stacks/stacks-keychain';
import { stxChainSlice } from '../chains/stx-chain.slice';
import * as inMemoryStore from '../in-memory-key/in-memory-storage';
import { keyActions } from './software-key.actions';
import { keyAdapter, keySlice } from './software-key.slice';

vi.mock('@app/store', () => ({
  persistor: { flush: vi.fn(() => Promise.resolve()) },
  store: { getState: vi.fn(), dispatch: vi.fn() },
}));

vi.mock('@app/store/session-restore', () => ({
  getWalletSessionKey: vi.fn(() => Promise.resolve({ success: false })),
  initalizeWalletSession: vi.fn(() => Promise.resolve()),
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
  salt,
  keys,
  wallets = [],
  stxChain = {},
}: {
  salt: string | undefined;
  keys: SoftwareKey[];
  wallets?: WalletStore[];
  stxChain?: Record<
    string,
    { highestAccountIndex: number; currentAccountStacksDescriptor: string }
  >;
}) {
  return {
    softwareKeys: { ...keyAdapter.addMany(keyAdapter.getInitialState(), keys), salt },
    wallets: walletAdapter.addMany(walletAdapter.getInitialState(), wallets),
    chains: { stx: stxChain },
  };
}

const password = 'correct-horse-battery-staple';
const realFingerprint = 'abcd1234';
const reEncryptType = keySlice.actions.softwareKeyReEncrypted.type;

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

describe('unlockWalletAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('current Argon2 wallet decrypts with the stored salt without re-encrypting', async () => {
    const state = buildState({
      salt: 'argon2-salt',
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'enc-current' }],
    });

    vi.mocked(decryptMnemonic).mockResolvedValue({
      secretKey: 'decrypted-mnemonic',
      encryptedSecretKey: 'enc-current',
      salt: 'argon2-salt',
      encryptionKey: 'encryption-key-current',
      fingerprint: realFingerprint,
    });

    const dispatch = vi.fn();
    const getState = vi.fn();
    getState.mockReturnValue(state);

    await keyActions.unlockWalletAction(password)(dispatch, getState, undefined);

    expect(decryptMnemonic).toHaveBeenCalledWith({
      password,
      encryptedSecretKey: 'enc-current',
      salt: 'argon2-salt',
    });

    // The salt already exists, so nothing is re-encrypted or re-persisted.
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: reEncryptType }));
    expect(persistor.flush).not.toHaveBeenCalled();

    expect(initalizeWalletSession).toHaveBeenCalledWith('encryption-key-current');
    expect(inMemoryStore.setKey).toHaveBeenCalledWith(realFingerprint, 'decrypted-mnemonic');
  });

  test('pre-Argon2 wallet persists the freshly re-encrypted key and its new salt', async () => {
    const state = buildState({
      salt: undefined,
      keys: [{ type: 'software', id: realFingerprint, encryptedSecretKey: 'enc-legacy' }],
    });

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

    expect(initalizeWalletSession).toHaveBeenCalledWith('encryption-key-legacy');
    expect(inMemoryStore.setKey).toHaveBeenCalledWith(realFingerprint, 'decrypted-mnemonic');
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
