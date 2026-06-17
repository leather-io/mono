import { makeAccountIdentifer } from '@leather.io/crypto';
import type { AccountId } from '@leather.io/models';

import type { WalletAccountRefTree } from '@app/store/common/wallet-type.selectors';

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

// Resolves the AccountId at a flat GroupedVirtuoso index by walking the group
// counts to find the owning wallet and the account's local position within it.
export function getAccountAt(
  groups: WalletAccountRefTree[],
  groupCounts: number[],
  globalIndex: number
): AccountId | undefined {
  let itemsBefore = 0;
  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    const count = groupCounts[groupIndex];
    if (globalIndex < itemsBefore + count) {
      return groups[groupIndex].accounts[globalIndex - itemsBefore];
    }
    itemsBefore += count;
  }
  return undefined;
}
