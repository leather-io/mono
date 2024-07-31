import { useSelector } from 'react-redux';

import { createAction, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit';

import type { RootState } from '..';
import { handleAppResetWithState, userAddsWallet, userRemovesWallet } from '../global-action';
import { BitcoinKeychainStore } from '../keychains/bitcoin/bitcoin-keychains.slice';
import { StacksKeychainStore } from '../keychains/stacks/stacks-keychains.slice';
import { handleEntityActionWith, makeAccountIdentifer } from '../utils';
import { initalizeAccount } from './accounts';

type AccountStatus = 'deleted';

export interface AccountStore {
  id: string;
  name?: string;
  status?: AccountStatus;
}

const adapter = createEntityAdapter<AccountStore, string>({
  selectId: account => account.id,
});

const initialState = adapter.getInitialState();

export const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      // Provision the first account with new wallet creation
      .addCase(userAddsWallet, (state, action) => {
        const firstAccountIndex = 0;
        const id = makeAccountIdentifer(action.payload.wallet.fingerprint, firstAccountIndex);
        adapter.addOne(state, { id });
      })

      .addCase(userRemovesWallet, (state, action) => {
        const fingerprint = action.payload.fingerprint;
        const accountIds = state.ids.filter(id => id.startsWith(fingerprint));
        adapter.removeMany(state, accountIds);
      })

      .addCase(
        userAddsAccount,
        handleEntityActionWith(adapter.addOne, payload => payload.account)
      )

      .addCase(
        userRemovesAccount,
        handleEntityActionWith(adapter.updateOne, payload => ({
          id: makeAccountIdentifer(payload.fingerprint, payload.accountIndex),
          changes: { status: 'deleted' } as const,
        }))
      )

      .addCase(...handleAppResetWithState(initialState)),
});

const selectors = adapter.getSelectors((state: RootState) => state.accounts);

export const selectAccounts = createSelector(selectors.selectAll, accounts =>
  accounts.filter(account => account.status !== 'deleted').map(account => initalizeAccount(account))
);

export function useAccounts(fingerprint: string) {
  return {
    list: useSelector(selectAccounts).filter(account => account.fingerprint === fingerprint),
  };
}

interface AddAccountPayload {
  account: AccountStore;
  withKeychains: {
    bitcoin: BitcoinKeychainStore[];
    stacks: StacksKeychainStore[];
  };
}
export const userAddsAccount = createAction<AddAccountPayload>('accounts/userAddsAccount');

interface RemoveAccountPayload {
  fingerprint: string;
  accountIndex: number;
}
export const userRemovesAccount = createAction<RemoveAccountPayload>('accounts/removeAccount');
