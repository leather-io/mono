import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import type { AccountId } from '@leather.io/models';

import { RootState } from '@app/store';

function selectSettings(state: RootState) {
  return state.settings;
}

function accountKey(fingerprint: string, accountIndex: number) {
  return `${fingerprint}:${accountIndex}`;
}

const selectCustomAccountNames = createSelector(
  selectSettings,
  state => state.customAccountNames ?? {}
);

const selectHiddenAccounts = createSelector(selectSettings, state => state.hiddenAccounts ?? []);

export function useCustomAccountName(accountId: AccountId) {
  const names = useSelector(selectCustomAccountNames);
  const key = accountKey(accountId.fingerprint, accountId.accountIndex);
  return names[key];
}

export function useIsAccountHidden(accountId: AccountId) {
  const hidden = useSelector(selectHiddenAccounts);
  const key = accountKey(accountId.fingerprint, accountId.accountIndex);
  return hidden.includes(key);
}

export { selectCustomAccountNames, selectHiddenAccounts };
