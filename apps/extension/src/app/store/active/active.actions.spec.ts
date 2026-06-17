import { beforeEach, describe, expect, test, vi } from 'vitest';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { userRemovesWallet } from '@leather.io/state/wallet';

import { broadcastWalletListChanged, sendMessage } from '@shared/messages';

import { persistor } from '@app/store';

import { selectHiddenAccountIds } from '../accounts/accounts.selectors';
import { selectWalletAccountRefTree } from '../common/wallet-type.selectors';
import { removeKey } from '../in-memory-key/in-memory-storage';
import { clearKeychainSelectorCaches } from '../in-memory-key/keychain-selector-cache';
import { selectCurrentAccount } from '../software-keys/software-key.selectors';
import { selectAllWallets } from '../wallets/wallet.selectors';
import {
  activateFirstVisibleAccount,
  applyRemoteWalletRemoval,
  removeWalletAndUpdateActive,
} from './active.actions';
import { userSwitchesAccount } from './active.slice';

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
}));

vi.mock('../in-memory-key/in-memory-storage', () => ({
  removeKey: vi.fn(),
}));

vi.mock('../in-memory-key/keychain-selector-cache', () => ({
  clearKeychainSelectorCaches: vi.fn(),
}));

vi.mock('@shared/messages', () => ({
  broadcastWalletListChanged: vi.fn(),
  broadcastReplayAction: vi.fn(),
  sendMessage: vi.fn(),
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
  const getState = vi.fn();
  getState.mockReturnValue(state);
  dispatch.mockImplementation((action: unknown) =>
    typeof action === 'function' ? action(dispatch, getState, undefined) : action
  );
  const promise = removeWalletAndUpdateActive(fingerprint)(dispatch, getState, undefined);
  return { dispatch, promise };
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
  });

  test('re-points to a remaining wallet when the removed wallet is the resolved current account', () => {
    vi.mocked(selectCurrentAccount).mockReturnValue({ fingerprint, accountIndex: 2 });
    const { dispatch } = runRemoveThunk();
    expect(dispatch).toHaveBeenCalledWith(userRemovesWallet({ fingerprint }));
    expect(dispatch).toHaveBeenCalledWith(
      userSwitchesAccount({ fingerprint: otherFingerprint, accountIndex: 0 })
    );
  });

  test('switches the active account to null when no wallets remain', () => {
    vi.mocked(selectAllWallets).mockReturnValue([
      { fingerprint, type: 'software', name: 'Wallet', createdOn: null },
    ]);
    const { dispatch } = runRemoveThunk();
    expect(dispatch).toHaveBeenCalledWith(userSwitchesAccount(null));
  });

  test('does not re-point when the removed wallet is not the current account', () => {
    vi.mocked(selectCurrentAccount).mockReturnValue({
      fingerprint: otherFingerprint,
      accountIndex: 0,
    });
    const { dispatch } = runRemoveThunk();
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

  test('skips leading hidden accounts when re-pointing to the remaining wallet', () => {
    vi.mocked(selectWalletAccountRefTree).mockReturnValue(
      makeWalletRefTree(otherFingerprint, [0, 1, 2])
    );
    vi.mocked(selectHiddenAccountIds).mockReturnValue([makeAccountIdentifer(otherFingerprint, 0)]);
    const { dispatch } = runRemoveThunk();
    expect(dispatch).toHaveBeenCalledWith(
      userSwitchesAccount({ fingerprint: otherFingerprint, accountIndex: 1 })
    );
  });
});

function runApplyRemoteRemovalThunk(state: object = { active: { account: null } }) {
  const dispatch = vi.fn();
  const getState = vi.fn();
  getState.mockReturnValue(state);
  dispatch.mockImplementation((action: unknown) =>
    typeof action === 'function' ? action(dispatch, getState, undefined) : action
  );
  applyRemoteWalletRemoval(fingerprint)(dispatch, getState, undefined);
  return { dispatch };
}

describe(applyRemoteWalletRemoval.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(selectCurrentAccount).mockReturnValue({ fingerprint, accountIndex: 0 });
    vi.mocked(selectAllWallets).mockReturnValue([
      { fingerprint, type: 'software', name: 'Wallet', createdOn: null },
      { fingerprint: otherFingerprint, type: 'software', name: 'Other', createdOn: null },
    ]);
    vi.mocked(selectWalletAccountRefTree).mockReturnValue(makeWalletRefTree(otherFingerprint, [0]));
    vi.mocked(selectHiddenAccountIds).mockReturnValue([]);
  });

  test('re-points the local active account to a remaining wallet when it was removed', () => {
    vi.mocked(selectCurrentAccount).mockReturnValue({ fingerprint, accountIndex: 2 });
    const { dispatch } = runApplyRemoteRemovalThunk();
    expect(dispatch).toHaveBeenCalledWith(userRemovesWallet({ fingerprint }));
    expect(dispatch).toHaveBeenCalledWith(
      userSwitchesAccount({ fingerprint: otherFingerprint, accountIndex: 0 })
    );
  });

  test('switches the local active account to null when no wallets remain', () => {
    vi.mocked(selectAllWallets).mockReturnValue([
      { fingerprint, type: 'software', name: 'Wallet', createdOn: null },
    ]);
    const { dispatch } = runApplyRemoteRemovalThunk();
    expect(dispatch).toHaveBeenCalledWith(userSwitchesAccount(null));
  });

  test('only removes the wallet when the local active account is a different wallet', () => {
    vi.mocked(selectCurrentAccount).mockReturnValue({
      fingerprint: otherFingerprint,
      accountIndex: 0,
    });
    const { dispatch } = runApplyRemoteRemovalThunk();
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(userRemovesWallet({ fingerprint }));
  });

  test('does not re-broadcast — each frame heals its own pointer', () => {
    vi.mocked(selectCurrentAccount).mockReturnValue({ fingerprint, accountIndex: 0 });
    runApplyRemoteRemovalThunk();
    expect(sendMessage).not.toHaveBeenCalled();
    expect(broadcastWalletListChanged).not.toHaveBeenCalled();
  });

  test('skips leading hidden accounts when re-pointing to the remaining wallet', () => {
    vi.mocked(selectWalletAccountRefTree).mockReturnValue(
      makeWalletRefTree(otherFingerprint, [0, 1, 2])
    );
    vi.mocked(selectHiddenAccountIds).mockReturnValue([makeAccountIdentifer(otherFingerprint, 0)]);
    const { dispatch } = runApplyRemoteRemovalThunk();
    expect(dispatch).toHaveBeenCalledWith(
      userSwitchesAccount({ fingerprint: otherFingerprint, accountIndex: 1 })
    );
  });
});
