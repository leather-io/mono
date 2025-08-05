import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '..';
import { destructAccountIdentifier, useAppDispatch } from '../utils';
import { selectReadonlyWalletFingerprints } from '../wallets/wallets.read';
import { initalizeAccount } from './accounts';
import {
  AddAccountPayload,
  AddReadonlyAccountPayload,
  accountsAdapter,
  userAddsAccount,
  userAddsReadonlyAccount,
} from './accounts.write';
import { AccountStatus } from './utils';

const accountSelectors = accountsAdapter.getSelectors((state: RootState) => state.accounts);

const selectAllAccounts = createSelector(
  accountSelectors.selectAll,
  selectReadonlyWalletFingerprints,
  (accounts, readonlyWalletFingerprints) =>
    accounts.map(acc => {
      const { fingerprint } = destructAccountIdentifier(acc.id);
      return {
        ...acc,
        isReadonly: readonlyWalletFingerprints.includes(fingerprint),
      };
    })
);

function selectAccounts(status?: AccountStatus) {
  return createSelector(selectAllAccounts, accounts => {
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

export function useSelectByAccountIds(accountIds: string[]) {
  return useSelector(selectByAccountIds(accountIds));
}

function selectByAccountIds(accountIds: string[]) {
  return createSelector(
    accountSelectors.selectEntities,
    selectReadonlyWalletFingerprints,
    (entities, readonlyWalletFingerprints) =>
      accountIds
        .map(id => entities[id])
        .map(account => {
          if (!account) throw new Error('No account found');
          const { fingerprint } = destructAccountIdentifier(account.id);
          const isReadonly = readonlyWalletFingerprints.includes(fingerprint);

          return initalizeAccount({ ...account, isReadonly });
        })
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
  const dispatch = useAppDispatch();

  const accountsList = useSelector(selectAccounts(status));
  function fromFingerprint(fingerprint: string) {
    return accountsList.filter(account => account.fingerprint === fingerprint);
  }
  function fromAccountIndex(fingerprint: string, accountIndex: number) {
    return fromFingerprint(fingerprint).filter(account => account.accountIndex === accountIndex);
  }
  return {
    list: accountsList,
    add(params: { action: AddAccountPayload }) {
      return dispatch(userAddsAccount(params.action));
    },
    addReadonly(params: { action: AddReadonlyAccountPayload }) {
      return dispatch(userAddsReadonlyAccount(params.action));
    },
    hasAccounts: accountsList.length > 0,
    fromFingerprint,
    fromAccountIndex,
  };
}

export function useAccountByIndex(fingerprint: string, index: number) {
  return useSelector(selectAccountByIndex(fingerprint, index));
}
