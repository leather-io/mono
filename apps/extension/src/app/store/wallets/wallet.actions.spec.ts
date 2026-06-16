import { describe, expect, test, vi } from 'vitest';

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
  walletAdapter,
  walletSlice,
} from '@leather.io/state/wallet';

import { assumedZeroFingerprint } from '@shared/utils';

import { addOrMigrateLedgerKeychains, migrateLedgerStacksFingerprint } from './wallet.actions';

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

function runThunk(
  state: ReturnType<typeof buildState>,
  args: { fingerprint: string; accountKeychains: Keychain[] }
) {
  const dispatch = vi.fn();
  const getState = vi.fn();
  getState.mockReturnValue(state);
  void addOrMigrateLedgerKeychains(args)(dispatch, getState, undefined);
  return dispatch;
}

describe('addOrMigrateLedgerKeychains', () => {
  test('migrates the legacy assumed-zero wallet when its device reconnects', () => {
    const state = buildState({ wallets: [legacyLedgerWallet], keychains: legacyKeychains });

    const dispatch = runThunk(state, {
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
  });

  test('leaves a single wallet entity after the migration cascade (no duplicate)', () => {
    const state = buildState({ wallets: [legacyLedgerWallet], keychains: legacyKeychains });

    const dispatch = runThunk(state, {
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

  test('adds a fresh wallet when no legacy wallet exists', () => {
    const dispatch = runThunk(buildState(), {
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
  });

  describe('when the wallet already exists under its real fingerprint', () => {
    const migratedWallet: WalletStore = {
      fingerprint: realFingerprint,
      name: 'My Ledger',
      type: 'ledger',
      createdOn: '2024-01-01T00:00:00.000Z',
    };

    test('merges only the newly pulled keychains', () => {
      const newKeychains = [stacksKeychain(realFingerprint, 2, '02cc')];
      const state = buildState({
        wallets: [migratedWallet],
        keychains: [stacksKeychain(realFingerprint, 0, '02aa')],
      });

      const dispatch = runThunk(state, {
        fingerprint: realFingerprint,
        accountKeychains: newKeychains,
      });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith(userAddsKeychains({ accountKeychains: newKeychains }));
    });

    test('does nothing when there are no new keychains', () => {
      const dispatch = runThunk(buildState({ wallets: [migratedWallet] }), {
        fingerprint: realFingerprint,
        accountKeychains: [],
      });

      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  test('does not migrate the legacy wallet when a different device connects', () => {
    const state = buildState({ wallets: [legacyLedgerWallet], keychains: legacyKeychains });

    const dispatch = runThunk(state, {
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
  });
});

function runMigration(state: ReturnType<typeof buildState>, fingerprint: string) {
  const dispatch = vi.fn();
  const getState = vi.fn();
  getState.mockReturnValue(state);
  void migrateLedgerStacksFingerprint({ fingerprint })(dispatch, getState, undefined);
  return dispatch;
}

describe('migrateLedgerStacksFingerprint', () => {
  test('re-keys the legacy Stacks keychains to the real fingerprint', () => {
    const state = buildState({ wallets: [legacyLedgerWallet], keychains: legacyKeychains });

    const dispatch = runMigration(state, realFingerprint);

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
  });

  test('preserves the keychains under the real fingerprint through the reducer cascade', () => {
    const state = buildState({ wallets: [legacyLedgerWallet], keychains: legacyKeychains });

    const dispatch = runMigration(state, realFingerprint);

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

  test('does nothing when the device reports the placeholder fingerprint', () => {
    const state = buildState({ wallets: [legacyLedgerWallet], keychains: legacyKeychains });

    const dispatch = runMigration(state, assumedZeroFingerprint);

    expect(dispatch).not.toHaveBeenCalled();
  });

  test('does nothing when there is no legacy wallet', () => {
    const dispatch = runMigration(buildState(), realFingerprint);

    expect(dispatch).not.toHaveBeenCalled();
  });

  test('does nothing when a wallet already exists under the real fingerprint', () => {
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

    const dispatch = runMigration(state, realFingerprint);

    expect(dispatch).not.toHaveBeenCalled();
  });

  test('does nothing when the legacy wallet is not a Ledger', () => {
    const softwareWallet: WalletStore = { ...legacyLedgerWallet, type: 'software' };
    const state = buildState({ wallets: [softwareWallet], keychains: legacyKeychains });

    const dispatch = runMigration(state, realFingerprint);

    expect(dispatch).not.toHaveBeenCalled();
  });
});
