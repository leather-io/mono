import { makeAccountIdentifer } from '@leather.io/crypto';
import type { AccountId } from '@leather.io/models';

import type { WalletAccountRefTree } from '@app/store/common/wallet-type.selectors';
import type { PolicyStore } from '@app/store/policy/policy-store.utils';

import {
  buildRecipientRows,
  getRecipientPolicies,
  getRowAt,
  getVisibleWalletAccountGroups,
} from './recipient-accounts-dialog.utils';

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

function stacksPolicyOf(parent: AccountId, address: string, networkId = 'mainnet'): PolicyStore {
  const parentAccountId = makeAccountIdentifer(parent.fingerprint, parent.accountIndex);
  return {
    id: `${parentAccountId}/${address}/${networkId}`,
    parentAccountId,
    networkId,
    chain: 'stacks',
    address,
    publicKeys: ['03aa', '02bb'],
    threshold: 2,
    role: 'signer',
  };
}

function bitcoinPolicyOf(parent: AccountId, address: string, networkId = 'mainnet'): PolicyStore {
  const parentAccountId = makeAccountIdentifer(parent.fingerprint, parent.accountIndex);
  return {
    id: `${parentAccountId}/${address}/${networkId}`,
    parentAccountId,
    networkId,
    chain: 'bitcoin',
    address,
    descriptor: 'wsh(sortedmulti(2,xpubA/0/0,xpubB/0/0))',
    role: 'signer',
  };
}

function noPolicies(): PolicyStore[] {
  return [];
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

describe('getRecipientPolicies', () => {
  const parent: AccountId = { fingerprint: 'aaaaaaaa', accountIndex: 0 };
  const stacksPolicy = stacksPolicyOf(parent, 'SM3CFXKD81GREH6MYFW4P9VKSSR2N525W3KDRH3P1');
  const bitcoinPolicy = bitcoinPolicyOf(
    parent,
    'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3'
  );

  it('returns policies matching parent, network and chain', () => {
    const policies = getRecipientPolicies(
      [stacksPolicy, bitcoinPolicy],
      parent,
      'mainnet',
      'stacks'
    );

    expect(policies).toEqual([stacksPolicy]);
  });

  it('excludes policies on another network', () => {
    const testnetPolicy = stacksPolicyOf(
      parent,
      'ST3CFXKD81GREH6MYFW4P9VKSSR2N525W3M2Z9GA9',
      'testnet'
    );

    expect(getRecipientPolicies([testnetPolicy], parent, 'mainnet', 'stacks')).toEqual([]);
  });

  it('excludes policies of a different chain', () => {
    expect(getRecipientPolicies([bitcoinPolicy], parent, 'mainnet', 'stacks')).toEqual([]);
    expect(getRecipientPolicies([stacksPolicy], parent, 'mainnet', 'bitcoin')).toEqual([]);
  });

  it('excludes policies belonging to another parent account', () => {
    const otherParent: AccountId = { fingerprint: 'aaaaaaaa', accountIndex: 1 };

    expect(getRecipientPolicies([stacksPolicy], otherParent, 'mainnet', 'stacks')).toEqual([]);
  });
});

describe('buildRecipientRows', () => {
  it('nests policies directly beneath their parent account', () => {
    const wallet = makeWallet('aaaaaaaa', 'ledger', 2);
    const policy = stacksPolicyOf(wallet.accounts[0], 'SM3CFXKD81GREH6MYFW4P9VKSSR2N525W3KDRH3P1');

    const rows = buildRecipientRows(wallet, account =>
      account.accountIndex === 0 ? [policy] : []
    );

    expect(rows.map(row => row.kind)).toEqual(['account', 'policy', 'account']);
  });

  it('emits only account rows for software wallets without policies', () => {
    const rows = buildRecipientRows(makeWallet('aaaaaaaa', 'software', 2), noPolicies);

    expect(rows.map(row => row.kind)).toEqual(['account', 'account']);
  });
});

describe('getRowAt', () => {
  function accountRowsFor(tree: WalletAccountRefTree[]) {
    const { groups } = getVisibleWalletAccountGroups(tree, []);
    return groups.map(wallet => buildRecipientRows(wallet, noPolicies));
  }

  it('resolves the third wallet account to its own wallet (bug #5: no collision with wallet 2)', () => {
    const rowGroups = accountRowsFor([softwareWallet, ledgerWalletTwo, ledgerWalletThree]);

    expect(getRowAt(rowGroups, 2)).toEqual({
      kind: 'account',
      accountId: { fingerprint: ledgerWalletThree.fingerprint, accountIndex: 0 },
    });
  });

  it('walks multi-account wallets by local index', () => {
    const ledgerWithTwoAccounts = makeWallet('bbbbbbbb', 'ledger', 2);
    const rowGroups = accountRowsFor([softwareWallet, ledgerWithTwoAccounts]);

    expect(getRowAt(rowGroups, 0)).toEqual({
      kind: 'account',
      accountId: { fingerprint: softwareWallet.fingerprint, accountIndex: 0 },
    });
    expect(getRowAt(rowGroups, 1)).toEqual({
      kind: 'account',
      accountId: { fingerprint: ledgerWithTwoAccounts.fingerprint, accountIndex: 0 },
    });
    expect(getRowAt(rowGroups, 2)).toEqual({
      kind: 'account',
      accountId: { fingerprint: ledgerWithTwoAccounts.fingerprint, accountIndex: 1 },
    });
  });

  it('resolves a policy row at its interleaved flat index across group boundaries', () => {
    const policy = stacksPolicyOf(
      softwareWallet.accounts[0],
      'SM3CFXKD81GREH6MYFW4P9VKSSR2N525W3KDRH3P1'
    );
    const rowGroups = [
      buildRecipientRows(softwareWallet, () => [policy]),
      buildRecipientRows(ledgerWalletTwo, noPolicies),
    ];

    expect(getRowAt(rowGroups, 1)).toEqual({ kind: 'policy', policy });
    expect(getRowAt(rowGroups, 2)).toEqual({
      kind: 'account',
      accountId: { fingerprint: ledgerWalletTwo.fingerprint, accountIndex: 0 },
    });
  });

  it('returns undefined for an out-of-range index', () => {
    const rowGroups = accountRowsFor([softwareWallet]);

    expect(getRowAt(rowGroups, 5)).toBeUndefined();
  });
});
