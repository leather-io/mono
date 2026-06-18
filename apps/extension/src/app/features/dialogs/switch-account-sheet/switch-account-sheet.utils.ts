import { makeAccountIdentifer } from '@leather.io/crypto';
import type { AccountId } from '@leather.io/models';

import type { WalletType } from '@app/store/common/wallet-type.selectors';

interface WalletGroup {
  type: WalletType;
  accounts: AccountId[];
}

export function getWalletGroupCounts(walletTree: WalletGroup[]): number[] {
  return walletTree.map(wallet => wallet.accounts.length + (wallet.type === 'software' ? 1 : 0));
}

export function isAddAccountRow(wallet: WalletGroup, localIndex: number): boolean {
  return wallet.type === 'software' && localIndex >= wallet.accounts.length;
}

interface CanHideAccountArgs {
  account: AccountId;
  activeAccount: AccountId;
  walletAccounts: AccountId[];
  hiddenAccountIds: string[];
}

export function canHideAccount({
  account,
  activeAccount,
  walletAccounts,
  hiddenAccountIds,
}: CanHideAccountArgs) {
  const isActiveAccount =
    account.fingerprint === activeAccount.fingerprint &&
    account.accountIndex === activeAccount.accountIndex;
  if (isActiveAccount) return false;

  const visibleAccountCount = walletAccounts.filter(
    acc => !hiddenAccountIds.includes(makeAccountIdentifer(acc.fingerprint, acc.accountIndex))
  ).length;
  return visibleAccountCount > 1;
}
