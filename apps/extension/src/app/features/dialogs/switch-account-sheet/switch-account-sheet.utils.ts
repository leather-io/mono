import { makeAccountIdentifer } from '@leather.io/crypto';
import type { AccountId } from '@leather.io/models';

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
