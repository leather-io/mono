import { makeAccountIdentifer } from '@leather.io/crypto';

import type { WalletAccountRefTree } from '@app/store/common/wallet-type.selectors';

import { getAccountAt, getVisibleWalletAccountGroups } from './recipient-accounts-dialog.utils';

function makeWallet(
  fingerprint: string,
  type: WalletAccountRefTree['type'],
  accountCount: number
): WalletAccountRefTree {
  return {
    fingerprint,
    name: `${type} ${fingerprint}`,
    type,
    accounts: Array.from({ length: accountCount }, (_, accountIndex) => ({
      fingerprint,
      accountIndex,
    })),
    createdOn: null,
  };
}

const softwareWallet = makeWallet('aaaaaaaa', 'software', 1);
const ledgerWalletTwo = makeWallet('bbbbbbbb', 'ledger', 1);
const ledgerWalletThree = makeWallet('cccccccc', 'ledger', 1);

describe('getVisibleWalletAccountGroups', () => {
  it('keeps every wallet as its own group (bug #4: accounts split per wallet)', () => {
    const tree = [softwareWallet, ledgerWalletTwo, ledgerWalletThree];

    const { groups, groupCounts } = getVisibleWalletAccountGroups(tree, []);

    expect(groups).toHaveLength(3);
    expect(groupCounts).toEqual([1, 1, 1]);
  });

  it('counts accounts per wallet with their own indices (bug #5: no shared numbering)', () => {
    const ledgerWithTwoAccounts = makeWallet('bbbbbbbb', 'ledger', 2);

    const { groupCounts, groups } = getVisibleWalletAccountGroups(
      [softwareWallet, ledgerWithTwoAccounts],
      []
    );

    expect(groupCounts).toEqual([1, 2]);
    expect(groups[1].accounts.map(account => account.accountIndex)).toEqual([0, 1]);
  });

  it('removes wallets whose only visible account is hidden and shifts counts', () => {
    const tree = [softwareWallet, ledgerWalletTwo, ledgerWalletThree];
    const hidden = [makeAccountIdentifer(ledgerWalletTwo.fingerprint, 0)];

    const { groups, groupCounts } = getVisibleWalletAccountGroups(tree, hidden);

    expect(groupCounts).toEqual([1, 1]);
    expect(groups.map(group => group.fingerprint)).toEqual([
      softwareWallet.fingerprint,
      ledgerWalletThree.fingerprint,
    ]);
  });
});

describe('getAccountAt', () => {
  it('resolves the third wallet account to its own wallet (bug #5: no collision with wallet 2)', () => {
    const tree = [softwareWallet, ledgerWalletTwo, ledgerWalletThree];
    const { groups, groupCounts } = getVisibleWalletAccountGroups(tree, []);

    const thirdWalletAccount = getAccountAt(groups, groupCounts, 2);

    expect(thirdWalletAccount).toEqual({
      fingerprint: ledgerWalletThree.fingerprint,
      accountIndex: 0,
    });
  });

  it('walks multi-account wallets by local index', () => {
    const ledgerWithTwoAccounts = makeWallet('bbbbbbbb', 'ledger', 2);
    const { groups, groupCounts } = getVisibleWalletAccountGroups(
      [softwareWallet, ledgerWithTwoAccounts],
      []
    );

    expect(getAccountAt(groups, groupCounts, 0)).toEqual({
      fingerprint: softwareWallet.fingerprint,
      accountIndex: 0,
    });
    expect(getAccountAt(groups, groupCounts, 1)).toEqual({
      fingerprint: ledgerWithTwoAccounts.fingerprint,
      accountIndex: 0,
    });
    expect(getAccountAt(groups, groupCounts, 2)).toEqual({
      fingerprint: ledgerWithTwoAccounts.fingerprint,
      accountIndex: 1,
    });
  });

  it('returns undefined for an out-of-range index', () => {
    const { groups, groupCounts } = getVisibleWalletAccountGroups([softwareWallet], []);

    expect(getAccountAt(groups, groupCounts, 5)).toBeUndefined();
  });
});
