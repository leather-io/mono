import { AccountId } from '@leather.io/models';

import { useAccountByIndex } from './accounts.read';
import { AccountStore, deriveIconFromAccountId } from './utils';

export function deserializeAccountId(accountId: string) {
  const [fingerprint, accountIndex] = accountId.split('/');
  if (!fingerprint || !accountIndex) throw new Error('Invalid account ID ' + accountId);
  return { fingerprint, accountIndex: Number(accountIndex) };
}

export function initializeAccount(account: AccountStore) {
  const accountId = deserializeAccountId(account.id);

  return {
    ...account,
    ...accountId,
    icon: account.icon ?? deriveIconFromAccountId(account.id),
  };
}

export type Account = ReturnType<typeof initializeAccount>;

interface AccountLoaderProps extends AccountId {
  fallback?: React.ReactNode;
  children(account: Account): React.ReactNode;
}
export function AccountLoader({
  fingerprint,
  accountIndex,
  fallback,
  children,
}: AccountLoaderProps) {
  const account = useAccountByIndex(fingerprint, accountIndex);
  if (!account) return fallback ?? null;
  return children(account);
}
