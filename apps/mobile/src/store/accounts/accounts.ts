import { AccountId } from '@/models/domain.model';

import { useAccountByIndex } from './accounts.read';
import { type AccountStore } from './accounts.write';

export function deserializeAccountId(accountId: string) {
  const [fingerprint, accountIndex] = accountId.split('/');
  if (!fingerprint || !accountIndex) throw new Error('Invalid account ID ' + accountId);
  return { fingerprint, accountIndex: Number(accountIndex) };
}

export function initalizeAccount(account: AccountStore) {
  return {
    ...account,
    ...deserializeAccountId(account.id),
    status: account.status ?? 'active',
  };
}

export type Account = ReturnType<typeof initalizeAccount>;

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
