import { CurrentAccount } from '@/store/settings/utils';
import { makeAccountIdentifer } from '@/store/utils';

export function getIsAccountSelected(accountId: string, currentAccount: CurrentAccount) {
  if (currentAccount) {
    const { fingerprint, accountIndex } = currentAccount;
    const currentAccountId = makeAccountIdentifer(fingerprint, accountIndex);
    return accountId === currentAccountId;
  }
  return false;
}
