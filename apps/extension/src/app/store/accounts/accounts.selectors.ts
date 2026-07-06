import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { makeAccountIdentifer } from '@leather.io/crypto';
import type { AccountId } from '@leather.io/models';

import { RootState } from '@app/store';

import { accountsAdapter } from './accounts.slice';

const selectors = accountsAdapter.getSelectors((state: RootState) => state.accounts);

export const selectHiddenAccountIds = createSelector(selectors.selectAll, accounts =>
  accounts.filter(account => account.status === 'hidden').map(account => account.id)
);

export function useHiddenAccountIds() {
  return useSelector(selectHiddenAccountIds);
}

// Returns the user-set custom name for an account, or undefined when none is
// set. Display defaults (BNS name, "Account N") are applied by callers.
export function useAccountNameOverride(accountId: AccountId) {
  const entities = useSelector(selectors.selectEntities);
  return entities[makeAccountIdentifer(accountId.fingerprint, accountId.accountIndex)]?.name;
}

export function useNameOverrideById(id: string | undefined) {
  const entities = useSelector(selectors.selectEntities);
  return id ? entities[id]?.name : undefined;
}
