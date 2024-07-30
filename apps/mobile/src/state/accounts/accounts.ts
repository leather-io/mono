import type { AccountStore } from './accounts.slice';

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
