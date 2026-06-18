import { describe, expect, test } from 'vitest';

import { makeAccountIdentifer } from '@leather.io/crypto';
import type { AccountId } from '@leather.io/models';

import type { WalletType } from '@app/store/common/wallet-type.selectors';

import {
  canHideAccount,
  getWalletGroupCounts,
  isAddAccountRow,
} from './switch-account-sheet.utils';

const fingerprint = 'a1b2c3d4';
function account(accountIndex: number): AccountId {
  return { fingerprint, accountIndex };
}
function idOf(acc: AccountId) {
  return makeAccountIdentifer(acc.fingerprint, acc.accountIndex);
}
function walletGroup(type: WalletType, accountCount: number) {
  return {
    type,
    accounts: Array.from({ length: accountCount }, (_, accountIndex) => account(accountIndex)),
  };
}

describe(getWalletGroupCounts.name, () => {
  test('software wallets reserve an extra row for the add-account button', () => {
    expect(getWalletGroupCounts([walletGroup('software', 3)])).toEqual([4]);
  });

  test('ledger wallets have no add-account row', () => {
    expect(getWalletGroupCounts([walletGroup('ledger', 3)])).toEqual([3]);
  });

  test('counts each wallet in a mixed tree', () => {
    expect(
      getWalletGroupCounts([
        walletGroup('software', 2),
        walletGroup('ledger', 1),
        walletGroup('software', 0),
      ])
    ).toEqual([3, 1, 1]);
  });
});

describe(isAddAccountRow.name, () => {
  test('the row past the last software account is the add-account row', () => {
    const wallet = walletGroup('software', 2);
    expect(isAddAccountRow(wallet, 0)).toBe(false);
    expect(isAddAccountRow(wallet, 1)).toBe(false);
    expect(isAddAccountRow(wallet, 2)).toBe(true);
  });

  test('ledger wallets never render an add-account row', () => {
    const wallet = walletGroup('ledger', 2);
    expect(isAddAccountRow(wallet, 2)).toBe(false);
  });
});

describe(canHideAccount.name, () => {
  test('cannot hide the active account', () => {
    const walletAccounts = [account(0), account(1)];

    expect(
      canHideAccount({
        account: account(0),
        activeAccount: account(0),
        walletAccounts,
        hiddenAccountIds: [],
      })
    ).toBe(false);
  });

  test('cannot hide a wallet last visible account', () => {
    const walletAccounts = [account(0), account(1)];
    const activeAccountInAnotherWallet: AccountId = { fingerprint: 'e5f6a7b8', accountIndex: 0 };

    expect(
      canHideAccount({
        account: account(1),
        activeAccount: activeAccountInAnotherWallet,
        walletAccounts,
        hiddenAccountIds: [idOf(account(0))],
      })
    ).toBe(false);
  });

  test('can hide a non-active account when other visible accounts remain', () => {
    const walletAccounts = [account(0), account(1), account(2)];

    expect(
      canHideAccount({
        account: account(1),
        activeAccount: account(0),
        walletAccounts,
        hiddenAccountIds: [],
      })
    ).toBe(true);
  });
});
