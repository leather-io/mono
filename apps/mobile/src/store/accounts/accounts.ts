import { AccountId } from '@leather.io/models';

import { useAccountByIndex } from './accounts.read';
import { AccountIcon, AccountStatus, AccountStore, deserializeAccountId } from './utils';

export interface Account {
  status: AccountStatus;
  fingerprint: string;
  accountIndex: number;
  id: string;
  icon: AccountIcon;
  name: string;
  isReadonly: boolean;
}

interface InitializeAccountData extends AccountStore {
  isReadonly: boolean;
}

export function initalizeAccount(account: InitializeAccountData): Account {
  return {
    ...account,
    ...deserializeAccountId(account.id),
    status: account.status ?? 'active',
  };
}

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
