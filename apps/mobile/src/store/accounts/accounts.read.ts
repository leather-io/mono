import { useSelector } from 'react-redux';

import { t } from '@lingui/core/macro';
import { createSelector } from '@reduxjs/toolkit';

import { isDefined } from '@leather.io/utils';

import { RootState } from '..';
import { accountsAdapter } from './accounts.write';
import { AccountStatus, type AccountStore, deriveIconFromAccountId } from './utils';

export function deserializeAccountId(accountId: string) {
  const [fingerprint, accountIndex] = accountId.split('/');
  if (!fingerprint || !accountIndex) throw new Error('Invalid account ID ' + accountId);
  return { fingerprint, accountIndex: Number(accountIndex) };
}

function initializeAccount(account: AccountStore) {
  const accountId = deserializeAccountId(account.id);
  const displayIndex = accountId.accountIndex + 1;

  return {
    ...account,
    ...accountId,
    status: account.status ?? ('active' satisfies AccountStatus),
    name: account.name ?? t`Account ${displayIndex}`,
    icon: account.icon ?? deriveIconFromAccountId(account.id),
  };
}

export type Account = ReturnType<typeof initializeAccount>;

const selectors = accountsAdapter.getSelectors((state: RootState) => state.accounts);

function selectAccounts(status?: AccountStatus) {
  return createSelector(selectors.selectAll, accounts =>
    accounts
      .map(account => initializeAccount(account))
      .filter(account => {
        if (status) return account.status === status;
        return true;
      })
  );
}

export function useSelectByAccountIds(accountIds: string[]) {
  return useSelector(selectByAccountIds(accountIds));
}

function selectByAccountIds(accountIds: string[]) {
  return createSelector(selectors.selectEntities, entities =>
    accountIds
      .map(id => entities[id])
      .filter(isDefined)
      .map(account => initializeAccount(account))
  );
}

function selectAccountsByFingerprint(fingerprint: string, status?: AccountStatus) {
  return createSelector(selectAccounts(status), accounts =>
    accounts.filter(account => account.fingerprint === fingerprint)
  );
}

function selectAccountByIndex(fingerprint: string, idx: number) {
  return createSelector(
    selectAccountsByFingerprint(fingerprint),
    accounts => accounts.filter(account => account.accountIndex === idx)[0]
  );
}

export function useAccountsByFingerprint(fingerprint: string, status?: AccountStatus) {
  return {
    list: useSelector(selectAccountsByFingerprint(fingerprint, status)),
  };
}

export function useAccounts(status: AccountStatus = 'active') {
  const accountsList = useSelector(selectAccounts(status));

  function fromFingerprint(fingerprint: string) {
    return accountsList.filter(account => account.fingerprint === fingerprint);
  }

  function fromAccountIndex(fingerprint: string, accountIndex: number) {
    return fromFingerprint(fingerprint).filter(account => account.accountIndex === accountIndex);
  }

  return {
    list: accountsList,
    hasAccounts: accountsList.length > 0,
    fromFingerprint,
    fromAccountIndex,
  };
}

export function useAccountByIndex(fingerprint: string, index: number) {
  return useSelector(selectAccountByIndex(fingerprint, index));
}
