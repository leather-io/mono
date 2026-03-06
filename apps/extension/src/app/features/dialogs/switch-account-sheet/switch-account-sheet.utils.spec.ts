import { describe, expect, test } from 'vitest';

import { makeAccountIdentifer } from '@leather.io/crypto';
import type { AccountId } from '@leather.io/models';

import { canHideAccount } from './switch-account-sheet.utils';

const fingerprint = 'a1b2c3d4';
function account(accountIndex: number): AccountId {
  return { fingerprint, accountIndex };
}
function idOf(acc: AccountId) {
  return makeAccountIdentifer(acc.fingerprint, acc.accountIndex);
}

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
