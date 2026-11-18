import { makeAccountIdentifer } from '@leather.io/crypto';
import type { AccountId } from '@leather.io/models';

import type { WalletAccountRefTree } from '@app/store/common/wallet-type.selectors';
import type { PolicyStore } from '@app/store/policy/policy-store.utils';
import { filterPoliciesByParentAndNetwork } from '@app/store/policy/policy.selectors';

interface VisibleWalletAccountGroups {
  groups: WalletAccountRefTree[];
  groupCounts: number[];
}

// Filters hidden accounts out of each wallet, drops wallets with no visible
// accounts, and returns the wallets alongside the per-wallet account counts used
// to drive a GroupedVirtuoso list.
export function getVisibleWalletAccountGroups(
  walletTree: WalletAccountRefTree[],
  hiddenAccountIds: string[]
): VisibleWalletAccountGroups {
  const groups = walletTree
    .map(wallet => ({
      ...wallet,
      accounts: wallet.accounts.filter(
        account =>
          !hiddenAccountIds.includes(
            makeAccountIdentifer(account.fingerprint, account.accountIndex)
          )
      ),
    }))
    .filter(wallet => wallet.accounts.length > 0);

  return { groups, groupCounts: groups.map(wallet => wallet.accounts.length) };
}

type RecipientRow =
  | { kind: 'account'; accountId: AccountId }
  | { kind: 'policy'; policy: PolicyStore };

export function getRecipientPolicies(
  policies: PolicyStore[],
  account: AccountId,
  networkId: string,
  chain: PolicyStore['chain']
): PolicyStore[] {
  return filterPoliciesByParentAndNetwork(
    policies,
    makeAccountIdentifer(account.fingerprint, account.accountIndex),
    networkId
  ).filter(policy => policy.chain === chain);
}

export function buildRecipientRows(
  wallet: WalletAccountRefTree,
  getPolicies: (account: AccountId) => PolicyStore[]
): RecipientRow[] {
  const rows: RecipientRow[] = [];
  for (const accountId of wallet.accounts) {
    rows.push({ kind: 'account', accountId });
    for (const policy of getPolicies(accountId)) {
      rows.push({ kind: 'policy', policy });
    }
  }
  return rows;
}

// Resolves the row at a flat GroupedVirtuoso index by walking the per-wallet
// row groups to find the owning wallet and the row's local position within it.
export function getRowAt(
  rowGroups: RecipientRow[][],
  globalIndex: number
): RecipientRow | undefined {
  let itemsBefore = 0;
  for (let groupIndex = 0; groupIndex < rowGroups.length; groupIndex++) {
    const rows = rowGroups[groupIndex];
    if (globalIndex < itemsBefore + rows.length) {
      return rows[globalIndex - itemsBefore];
    }
    itemsBefore += rows.length;
  }
  return undefined;
}
