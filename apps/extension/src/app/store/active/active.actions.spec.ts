import { beforeEach, describe, expect, test, vi } from 'vitest';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { userRemovesWallet } from '@leather.io/state/wallet';

import { broadcastWalletListChanged } from '@shared/messages';

import { clearBiometricAutoPromptSuppression } from '@app/common/wallet-authentication/biometric-auto-prompt';
import { persistor } from '@app/store';

import { selectHiddenAccountIds } from '../accounts/accounts.selectors';
import { selectWalletAccountRefTree } from '../common/wallet-type.selectors';
import { removeKey } from '../in-memory-key/in-memory-storage';
import { clearKeychainSelectorCaches } from '../in-memory-key/keychain-selector-cache';
import { selectCurrentAccount, selectSoftwareKeys } from '../software-keys/software-key.selectors';
import { hydrateSlicesFromStorage } from '../utils/storage-sync';
import { selectAllWallets } from '../wallets/wallet.selectors';
import {
  activateFirstVisibleAccount,
  applyRemoteWalletRemoval,
  removeWalletAndUpdateActive,
} from './active.actions';
import { userSwitchesAccount } from './active.slice';

const mocks = vi.hoisted(() => ({
  readAuthoritativeWalletTransactionState: vi.fn(),
}));

vi.mock('@app/store', () => ({
  persistor: { flush: vi.fn(() => Promise.resolve()) },
  store: { getState: vi.fn(), dispatch: vi.fn() },
}));

vi.mock('../accounts/accounts.selectors', () => ({
  selectHiddenAccountIds: vi.fn(),
}));

vi.mock('../common/wallet-type.selectors', () => ({
  selectWalletAccountRefTree: vi.fn(),
}));

vi.mock('../wallets/wallet.selectors', () => ({
  selectAllWallets: vi.fn(),
}));

vi.mock('../software-keys/software-key.selectors', () => ({
  selectCurrentAccount: vi.fn(),
  selectSoftwareKeys: vi.fn(),
}));

vi.mock('../software-keys/software-key-state', () => ({
  readAuthoritativeWalletTransactionState: mocks.readAuthoritativeWalletTransactionState,
}));

vi.mock('@app/common/wallet-authentication/biometric-auto-prompt', () => ({
  clearBiometricAutoPromptSuppression: vi.fn(() => Promise.resolve()),
}));

vi.mock('../in-memory-key/in-memory-storage', () => ({
  removeKey: vi.fn(),
}));

vi.mock('../in-memory-key/keychain-selector-cache', () => ({
  clearKeychainSelectorCaches: vi.fn(),
}));

vi.mock('@shared/messages', () => ({
  broadcastWalletListChanged: vi.fn(),
}));

const fingerprint = 'deadbeef';
const otherFingerprint = 'cafebabe';

function makeRefTree(accountIndices: number[]) {
  return [
    {
      fingerprint,
      name: 'My Ledger',
      type: 'ledger' as const,
      createdOn: null,
      accounts: accountIndices.map(accountIndex => ({ fingerprint, accountIndex })),
    },
  ];
}

function runThunk() {
  const dispatch = vi.fn();
  const getState = vi.fn();
  getState.mockReturnValue({});
  void activateFirstVisibleAccount(fingerprint)(dispatch, getState, undefined);
  return dispatch;
}

describe(activateFirstVisibleAccount.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(selectWalletAccountRefTree).mockReturnValue(makeRefTree([0, 1, 2]));
    vi.mocked(selectHiddenAccountIds).mockReturnValue([]);
    vi.mocked(selectSoftwareKeys).mockReturnValue([
      { id: fingerprint, type: 'software', encryptedSecretKey: 'first' },
      { id: otherFingerprint, type: 'software', encryptedSecretKey: 'second' },
    ]);
  });

  test('activates account 0 when no accounts are hidden', () => {
    const dispatch = runThunk();
    expect(dispatch).toHaveBeenCalledWith(userSwitchesAccount({ fingerprint, accountIndex: 0 }));
  });

  test('activates the first visible account when account 0 is hidden', () => {
    vi.mocked(selectHiddenAccountIds).mockReturnValue([makeAccountIdentifer(fingerprint, 0)]);
    const dispatch = runThunk();
    expect(dispatch).toHaveBeenCalledWith(userSwitchesAccount({ fingerprint, accountIndex: 1 }));
  });

  test('skips consecutive leading hidden accounts', () => {
    vi.mocked(selectHiddenAccountIds).mockReturnValue([
      makeAccountIdentifer(fingerprint, 0),
      makeAccountIdentifer(fingerprint, 1),
    ]);
    const dispatch = runThunk();
    expect(dispatch).toHaveBeenCalledWith(userSwitchesAccount({ fingerprint, accountIndex: 2 }));
  });

  test('falls back to account 0 when every account is hidden', () => {
    vi.mocked(selectHiddenAccountIds).mockReturnValue([
      makeAccountIdentifer(fingerprint, 0),
      makeAccountIdentifer(fingerprint, 1),
      makeAccountIdentifer(fingerprint, 2),
    ]);
    const dispatch = runThunk();
    expect(dispatch).toHaveBeenCalledWith(userSwitchesAccount({ fingerprint, accountIndex: 0 }));
  });

  test('falls back to account 0 when the wallet is absent from the ref tree', () => {
    vi.mocked(selectWalletAccountRefTree).mockReturnValue([]);
    const dispatch = runThunk();
    expect(dispatch).toHaveBeenCalledWith(userSwitchesAccount({ fingerprint, accountIndex: 0 }));
  });

  test('ignores hidden accounts belonging to other wallets', () => {
    vi.mocked(selectHiddenAccountIds).mockReturnValue([makeAccountIdentifer('cafebabe', 0)]);
    const dispatch = runThunk();
    expect(dispatch).toHaveBeenCalledWith(userSwitchesAccount({ fingerprint, accountIndex: 0 }));
  });
});

function makeWalletRefTree(walletFingerprint: string, accountIndices: number[]) {
  return [
    {
      fingerprint: walletFingerprint,
      name: 'Wallet',
      type: 'software' as const,
      createdOn: null,
      accounts: accountIndices.map(accountIndex => ({
        fingerprint: walletFingerprint,
        accountIndex,
      })),
    },
  ];
}

function runRemoveThunk(state: object = { active: { account: null } }) {
  const dispatch = vi.fn();
  const structuralDispatch = vi.fn();
  const getState = vi.fn();
  getState.mockReturnValue(state);
  dispatch.mockImplementation((action: unknown) => {
    if (hydrateSlicesFromStorage.match(action)) return action;
    if (typeof action === 'function') return action(dispatch, getState, undefined);
    return structuralDispatch(action);
  });
  mocks.readAuthoritativeWalletTransactionState.mockResolvedValue({ state });
  const promise = removeWalletAndUpdateActive(fingerprint)(dispatch, getState, undefined);
  return { dispatch: structuralDispatch, promise };
}

describe(removeWalletAndUpdateActive.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(selectCurrentAccount).mockReturnValue({ fingerprint, accountIndex: 0 });
    vi.mocked(selectAllWallets).mockReturnValue([
      { fingerprint, type: 'software', name: 'Wallet', createdOn: null },
      { fingerprint: otherFingerprint, type: 'software', name: 'Other', createdOn: null },
    ]);
    vi.mocked(selectWalletAccountRefTree).mockReturnValue(makeWalletRefTree(otherFingerprint, [0]));
    vi.mocked(selectHiddenAccountIds).mockReturnValue([]);
    vi.mocked(selectSoftwareKeys).mockReturnValue([
      { id: fingerprint, type: 'software', encryptedSecretKey: 'first' },
      { id: otherFingerprint, type: 'software', encryptedSecretKey: 'second' },
    ]);
  });

  test('re-points to a remaining wallet when the removed wallet is the resolved current account', async () => {
    vi.mocked(selectCurrentAccount).mockReturnValue({ fingerprint, accountIndex: 2 });
    const { dispatch, promise } = runRemoveThunk();
    await promise;
    expect(dispatch).toHaveBeenCalledWith(userRemovesWallet({ fingerprint }));
    expect(dispatch).toHaveBeenCalledWith(
      userSwitchesAccount({ fingerprint: otherFingerprint, accountIndex: 0 })
    );
  });

  test('switches the active account to null when no wallets remain', async () => {
    vi.mocked(selectAllWallets).mockReturnValue([
      { fingerprint, type: 'software', name: 'Wallet', createdOn: null },
    ]);
    const { dispatch, promise } = runRemoveThunk();
    await promise;
    expect(dispatch).toHaveBeenCalledWith(userSwitchesAccount(null));
  });

  test('does not re-point when the removed wallet is not the current account', async () => {
    vi.mocked(selectCurrentAccount).mockReturnValue({
      fingerprint: otherFingerprint,
      accountIndex: 0,
    });
    const { dispatch, promise } = runRemoveThunk();
    await promise;
    expect(dispatch).toHaveBeenCalledWith(userRemovesWallet({ fingerprint }));
    expect(dispatch).not.toHaveBeenCalledWith(expect.any(Function));
  });

  test('removes the in-memory key, flushes the persistor, and broadcasts the change', async () => {
    const { promise } = runRemoveThunk();
    await promise;
    expect(removeKey).toHaveBeenCalledWith(fingerprint);
    expect(persistor.flush).toHaveBeenCalledTimes(1);
    expect(broadcastWalletListChanged).toHaveBeenCalledWith({ removedFingerprint: fingerprint });
  });

  test('purges keychain selector caches so derived key material does not linger', async () => {
    const { promise } = runRemoveThunk();
    await promise;
    expect(removeKey).toHaveBeenCalledWith(fingerprint);
    expect(clearKeychainSelectorCaches).toHaveBeenCalledTimes(1);
  });

  test('clears automatic biometric prompt suppression after removing the final software wallet', async () => {
    vi.mocked(selectSoftwareKeys).mockReturnValue([
      { id: fingerprint, type: 'software', encryptedSecretKey: 'first' },
    ]);
    const { promise } = runRemoveThunk();

    await promise;

    expect(clearBiometricAutoPromptSuppression).toHaveBeenCalledTimes(1);
  });

  test('skips leading hidden accounts when re-pointing to the remaining wallet', async () => {
    vi.mocked(selectWalletAccountRefTree).mockReturnValue(
      makeWalletRefTree(otherFingerprint, [0, 1, 2])
    );
    vi.mocked(selectHiddenAccountIds).mockReturnValue([makeAccountIdentifer(otherFingerprint, 0)]);
    const { dispatch, promise } = runRemoveThunk();
    await promise;
    expect(dispatch).toHaveBeenCalledWith(
      userSwitchesAccount({ fingerprint: otherFingerprint, accountIndex: 1 })
    );
  });
});

function runApplyRemoteRemovalThunk(state: object = { active: { account: null } }) {
  const dispatch = vi.fn();
  const getState = vi.fn();
  getState.mockReturnValue(state);
  mocks.readAuthoritativeWalletTransactionState.mockResolvedValue({ state });
  const promise = applyRemoteWalletRemoval()(dispatch, getState, undefined);
  return { dispatch, promise };
}

describe(applyRemoteWalletRemoval.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('hydrates the wallet state already persisted by the source frame', async () => {
    const state = {
      active: {
        account: { fingerprint: otherFingerprint, accountIndex: 0 },
        activePolicyId: null,
      },
    };
    const { dispatch, promise } = runApplyRemoteRemovalThunk(state);

    await promise;

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(hydrateSlicesFromStorage(state));
  });

  test('does not dirty or flush stale local wallet slices', async () => {
    const { dispatch, promise } = runApplyRemoteRemovalThunk();

    await promise;

    expect(dispatch).not.toHaveBeenCalledWith(userRemovesWallet({ fingerprint }));
    expect(dispatch).not.toHaveBeenCalledWith(userSwitchesAccount(expect.anything()));
    expect(persistor.flush).not.toHaveBeenCalled();
    expect(broadcastWalletListChanged).not.toHaveBeenCalled();
  });
});
