import { beforeEach, describe, expect, test, vi } from 'vitest';

import { makeAccountIdentifer } from '@leather.io/crypto';

import { selectHiddenAccountIds } from '../accounts/accounts.selectors';
import { selectWalletAccountRefTree } from '../common/wallet-type.selectors';
import { activateFirstVisibleAccount } from './active.actions';
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

const fingerprint = 'deadbeef';

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
  activateFirstVisibleAccount(fingerprint)(dispatch, getState, undefined);
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
