import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '..';
import { initalizeAccount } from './accounts';
import { accountsAdapter } from './accounts.write';
import { AccountStatus } from './utils';

const selectors = accountsAdapter.getSelectors((state: RootState) => state.accounts);

export function selectAccounts(status?: AccountStatus) {
  return createSelector(selectors.selectAll, accounts => {
    switch (status) {
      case 'active':
        return accounts.filter(account => account.status === 'active').map(initalizeAccount);
      case 'hidden':
        return accounts.filter(account => account.status === 'hidden').map(initalizeAccount);
      default:
        return accounts.map(initalizeAccount);
    }
  });
}

export function selectAccountsByFingerprint(fingerprint: string, status?: AccountStatus) {
  return createSelector(selectAccounts(status), accounts =>
    accounts.filter(account => account.fingerprint === fingerprint)
  );
}

export function selectAccountByIndex(fingerprint: string, idx: number) {
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

export function useAccounts(status?: AccountStatus) {
  return {
    list: useSelector(selectAccounts(status)),
  };
}

export function useAccountByIndex(fingerprint: string, index: number) {
  return useSelector(selectAccountByIndex(fingerprint, index));
}
