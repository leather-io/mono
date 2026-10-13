import { AccountId } from '@leather.io/models';

import { type Account, deserializeAccountId, useAccountByIndex } from './accounts.read';

export { type Account, deserializeAccountId };

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
