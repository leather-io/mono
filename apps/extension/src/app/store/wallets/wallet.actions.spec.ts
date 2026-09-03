import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  createDescriptor,
  createKeyOriginPath,
  extractFingerprintFromDescriptor,
} from '@leather.io/crypto';
import { userAddsKeychains } from '@leather.io/state';
import { type Keychain, keychainAdapter, keychainSlice } from '@leather.io/state/keychains';
import {
  type WalletStore,
  fingerprintMigration,
  userAddsWallet,
  userRemovesWallet,
  userRenamesWallet,
  walletAdapter,
  walletSlice,
} from '@leather.io/state/wallet';

import { broadcastWalletListChanged } from '@shared/messages';
import { assumedZeroFingerprint } from '@shared/utils';

import { persistor } from '@app/store';

import { hydrateSlicesFromStorage } from '../utils/storage-sync';
import {
  addOrMigrateLedgerKeychains,
  migrateLedgerStacksFingerprint,
  renameWallet,
} from './wallet.actions';

const mocks = vi.hoisted(() => ({
  readAuthoritativeWalletTransactionState: vi.fn(),
}));

vi.mock('@app/store', () => ({
  persistor: { flush: vi.fn(() => Promise.resolve()) },
  store: { getState: vi.fn(), dispatch: vi.fn() },
}));

vi.mock('@shared/messages', () => ({
  broadcastWalletListChanged: vi.fn(),
}));

vi.mock('../software-keys/software-key-state', () => ({
  readAuthoritativeWalletTransactionState: mocks.readAuthoritativeWalletTransactionState,
}));

const realFingerprint = 'a1b2c3d4';
const otherDeviceFingerprint = 'eeee9999';

function stacksKeychain(fingerprint: string, accountIndex: number, publicKey: string): Keychain {
  const keyOrigin = createKeyOriginPath(fingerprint, `44'/5757'/0'/0/${accountIndex}`);
  return { chain: 'stacks', descriptor: createDescriptor(keyOrigin, publicKey) };
}

const legacyLedgerWallet: WalletStore = {
  fingerprint: assumedZeroFingerprint,
  name: 'My Ledger',
  type: 'ledger',
  createdOn: null,
};

// The placeholder-keyed keychains the legacy Stacks-only Ledger left in the store.
const legacyKeychains = [
  stacksKeychain(assumedZeroFingerprint, 0, '02aa'),
  stacksKeychain(assumedZeroFingerprint, 1, '02bb'),
];

// The same physical device re-pulled through the add-keys flow: identical public
// keys, but now under the device's real fingerprint.
const reconnectedKeychains = [
  stacksKeychain(realFingerprint, 0, '02aa'),
  stacksKeychain(realFingerprint, 1, '02bb'),
];

function buildState({
  wallets = [],
  keychains = [],
}: {
  wallets?: WalletStore[];
  keychains?: Keychain[];
} = {}) {
  return {
    wallets: walletAdapter.addMany(walletAdapter.getInitialState(), wallets),
    keychains: keychainAdapter.addMany(keychainAdapter.getInitialState(), keychains),
  };
}

async function runThunk(
  state: ReturnType<typeof buildState>,
  args: { fingerprint: string; accountKeychains: Keychain[] }
) {
  const dispatch = vi.fn();
  const structuralDispatch = vi.fn();
  const getState = vi.fn();
  getState.mockReturnValue(state);
  dispatch.mockImplementation(action => {
    if (!hydrateSlicesFromStorage.match(action)) structuralDispatch(action);
    return action;
  });
  mocks.readAuthoritativeWalletTransactionState.mockResolvedValue({ state });
  await addOrMigrateLedgerKeychains(args)(dispatch, getState, undefined);
  return structuralDispatch;
}

describe('addOrMigrateLedgerKeychains', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('migrates the legacy assumed-zero wallet when its device reconnects', async () => {
    const state = buildState({ wallets: [legacyLedgerWallet], keychains: legacyKeychains });

    const dispatch = await runThunk(state, {
      fingerprint: realFingerprint,
      accountKeychains: reconnectedKeychains,
    });

    expect(dispatch).toHaveBeenNthCalledWith(1, fingerprintMigration(realFingerprint));
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      userRemovesWallet({ fingerprint: assumedZeroFingerprint })
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      3,
      userAddsWallet({
        wallet: {
          fingerprint: realFingerprint,
          name: 'My Ledger',
          type: 'ledger',
          createdOn: null,
        },
        accountKeychains: reconnectedKeychains,
      })
    );
    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(persistor.flush).toHaveBeenCalledTimes(1);
    expect(broadcastWalletListChanged).toHaveBeenCalledWith({});
  });

  test('leaves a single wallet entity after the migration cascade (no duplicate)', async () => {
    const state = buildState({ wallets: [legacyLedgerWallet], keychains: legacyKeychains });

    const dispatch = await runThunk(state, {
      fingerprint: realFingerprint,
      accountKeychains: reconnectedKeychains,
    });

    // Feed the thunk's actual dispatched actions through the real wallet reducer.
    let walletState = walletAdapter.addMany(walletAdapter.getInitialState(), [legacyLedgerWallet]);
    for (const [action] of dispatch.mock.calls) {
      walletState = walletSlice.reducer(walletState, action);
    }

    expect(walletState.ids).toEqual([realFingerprint]);
    expect(walletState.entities[realFingerprint]?.name).toBe('My Ledger');
  });

  test('adds a fresh wallet when no legacy wallet exists', async () => {
    const dispatch = await runThunk(buildState(), {
      fingerprint: realFingerprint,
      accountKeychains: [stacksKeychain(realFingerprint, 0, '02aa')],
    });

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: userAddsWallet.type,
        payload: expect.objectContaining({
          wallet: expect.objectContaining({ fingerprint: realFingerprint, type: 'ledger' }),
        }),
      })
    );
    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: fingerprintMigration.type })
    );
    expect(persistor.flush).toHaveBeenCalledTimes(1);
    expect(broadcastWalletListChanged).toHaveBeenCalledWith({});
  });

  describe('when the wallet already exists under its real fingerprint', () => {
    const migratedWallet: WalletStore = {
      fingerprint: realFingerprint,
      name: 'My Ledger',
      type: 'ledger',
      createdOn: '2024-01-01T00:00:00.000Z',
    };

    test('merges only the newly pulled keychains', async () => {
      const newKeychains = [stacksKeychain(realFingerprint, 2, '02cc')];
      const state = buildState({
        wallets: [migratedWallet],
        keychains: [stacksKeychain(realFingerprint, 0, '02aa')],
      });

      const dispatch = await runThunk(state, {
        fingerprint: realFingerprint,
        accountKeychains: newKeychains,
      });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith(userAddsKeychains({ accountKeychains: newKeychains }));
      expect(persistor.flush).toHaveBeenCalledTimes(1);
      expect(broadcastWalletListChanged).toHaveBeenCalledWith({});
    });

    test('does nothing when there are no new keychains', async () => {
      const dispatch = await runThunk(buildState({ wallets: [migratedWallet] }), {
        fingerprint: realFingerprint,
        accountKeychains: [],
      });

      expect(dispatch).not.toHaveBeenCalled();
      expect(persistor.flush).not.toHaveBeenCalled();
      expect(broadcastWalletListChanged).not.toHaveBeenCalled();
    });
  });

  test('does not migrate the legacy wallet when a different device connects', async () => {
    const state = buildState({ wallets: [legacyLedgerWallet], keychains: legacyKeychains });

    const dispatch = await runThunk(state, {
      fingerprint: otherDeviceFingerprint,
      accountKeychains: [
        stacksKeychain(otherDeviceFingerprint, 0, '02dd'),
        stacksKeychain(otherDeviceFingerprint, 1, '02ee'),
      ],
    });

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: userAddsWallet.type,
        payload: expect.objectContaining({
          wallet: expect.objectContaining({ fingerprint: otherDeviceFingerprint }),
        }),
      })
    );
    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: fingerprintMigration.type })
    );
    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: userRemovesWallet.type })
    );
    expect(persistor.flush).toHaveBeenCalledTimes(1);
    expect(broadcastWalletListChanged).toHaveBeenCalledWith({});
  });
});

async function runMigration(state: ReturnType<typeof buildState>, fingerprint: string) {
  const dispatch = vi.fn();
  const structuralDispatch = vi.fn();
  const getState = vi.fn();
  getState.mockReturnValue(state);
  dispatch.mockImplementation(action => {
    if (!hydrateSlicesFromStorage.match(action)) structuralDispatch(action);
    return action;
  });
  mocks.readAuthoritativeWalletTransactionState.mockResolvedValue({ state });
  await migrateLedgerStacksFingerprint({ fingerprint })(dispatch, getState, undefined);
  return structuralDispatch;
}

describe('migrateLedgerStacksFingerprint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('re-keys the legacy Stacks keychains to the real fingerprint', async () => {
    const state = buildState({ wallets: [legacyLedgerWallet], keychains: legacyKeychains });

    const dispatch = await runMigration(state, realFingerprint);

    expect(dispatch).toHaveBeenNthCalledWith(1, fingerprintMigration(realFingerprint));
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      userRemovesWallet({ fingerprint: assumedZeroFingerprint })
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      3,
      userAddsWallet({
        wallet: {
          fingerprint: realFingerprint,
          name: 'My Ledger',
          type: 'ledger',
          createdOn: null,
        },
        accountKeychains: reconnectedKeychains,
      })
    );
    expect(dispatch).toHaveBeenCalledTimes(3);
    expect(persistor.flush).toHaveBeenCalledTimes(1);
    expect(broadcastWalletListChanged).toHaveBeenCalledWith({});
  });

  test('preserves the keychains under the real fingerprint through the reducer cascade', async () => {
    const state = buildState({ wallets: [legacyLedgerWallet], keychains: legacyKeychains });

    const dispatch = await runMigration(state, realFingerprint);

    // Feed the thunk's actual dispatched actions through the real keychain reducer.
    let keychainState = keychainAdapter.addMany(keychainSlice.getInitialState(), legacyKeychains);
    for (const [action] of dispatch.mock.calls) {
      keychainState = keychainSlice.reducer(keychainState, action);
    }

    const remaining = keychainAdapter.getSelectors().selectAll(keychainState);
    expect(remaining).toHaveLength(2);
    expect(
      remaining.map(keychain => extractFingerprintFromDescriptor(keychain.descriptor))
    ).toEqual([realFingerprint, realFingerprint]);
  });

  test('does nothing when the device reports the placeholder fingerprint', async () => {
    const state = buildState({ wallets: [legacyLedgerWallet], keychains: legacyKeychains });

    const dispatch = await runMigration(state, assumedZeroFingerprint);

    expect(dispatch).not.toHaveBeenCalled();
    expect(persistor.flush).not.toHaveBeenCalled();
    expect(broadcastWalletListChanged).not.toHaveBeenCalled();
  });

  test('does nothing when there is no legacy wallet', async () => {
    const dispatch = await runMigration(buildState(), realFingerprint);

    expect(dispatch).not.toHaveBeenCalled();
    expect(persistor.flush).not.toHaveBeenCalled();
    expect(broadcastWalletListChanged).not.toHaveBeenCalled();
  });

  test('does nothing when a wallet already exists under the real fingerprint', async () => {
    const migratedWallet: WalletStore = {
      fingerprint: realFingerprint,
      name: 'My Ledger',
      type: 'ledger',
      createdOn: null,
    };
    const state = buildState({
      wallets: [legacyLedgerWallet, migratedWallet],
      keychains: legacyKeychains,
    });

    const dispatch = await runMigration(state, realFingerprint);

    expect(dispatch).not.toHaveBeenCalled();
    expect(persistor.flush).not.toHaveBeenCalled();
    expect(broadcastWalletListChanged).not.toHaveBeenCalled();
  });

  test('does nothing when the legacy wallet is not a Ledger', async () => {
    const softwareWallet: WalletStore = { ...legacyLedgerWallet, type: 'software' };
    const state = buildState({ wallets: [softwareWallet], keychains: legacyKeychains });

    const dispatch = await runMigration(state, realFingerprint);

    expect(dispatch).not.toHaveBeenCalled();
    expect(persistor.flush).not.toHaveBeenCalled();
    expect(broadcastWalletListChanged).not.toHaveBeenCalled();
  });
});

describe(renameWallet.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('hydrates authoritative state and verifies the durable wallet name', async () => {
    const wallet: WalletStore = {
      fingerprint: realFingerprint,
      name: 'Wallet 1',
      type: 'software',
      createdOn: null,
    };
    const state = buildState({ wallets: [wallet] });
    const persistedState = buildState({ wallets: [{ ...wallet, name: 'Savings' }] });
    mocks.readAuthoritativeWalletTransactionState
      .mockResolvedValueOnce({ state })
      .mockResolvedValueOnce({ state: persistedState });
    const dispatch = vi.fn();

    await renameWallet({ fingerprint: realFingerprint, name: 'Savings' })(
      dispatch,
      vi.fn(),
      undefined
    );

    expect(dispatch).toHaveBeenNthCalledWith(1, hydrateSlicesFromStorage(state));
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      userRenamesWallet({ fingerprint: realFingerprint, name: 'Savings' })
    );
    expect(persistor.flush).toHaveBeenCalledTimes(1);
  });
});
