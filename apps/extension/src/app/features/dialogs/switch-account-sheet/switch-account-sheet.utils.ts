import { makeAccountIdentifer } from '@leather.io/crypto';
import type { AccountId } from '@leather.io/models';

import type { WalletType } from '@app/store/common/wallet-type.selectors';
import type { PolicyStore } from '@app/store/policy/policy-store.utils';

export const accountActionMenuTriggerSize = '40px';

interface WalletGroup {
  type: WalletType;
  accounts: AccountId[];
}

type SwitchAccountRow =
  | { kind: 'account'; accountId: AccountId }
  | { kind: 'policy'; policy: PolicyStore }
  | { kind: 'addAccount' };

export function buildWalletRows(
  wallet: WalletGroup,
  getPolicies: (account: AccountId) => PolicyStore[]
): SwitchAccountRow[] {
  const rows: SwitchAccountRow[] = [];
  for (const accountId of wallet.accounts) {
    rows.push({ kind: 'account', accountId });
    for (const policy of getPolicies(accountId)) {
      rows.push({ kind: 'policy', policy });
    }
  }
  if (wallet.type === 'software') rows.push({ kind: 'addAccount' });
  return rows;
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
