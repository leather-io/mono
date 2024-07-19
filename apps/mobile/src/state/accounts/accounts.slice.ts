import { createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { extractKeyOriginPathFromDescriptor } from '@leather.io/crypto';

import { handleAppResetWithState, userAddsWallet, userRemovesWallet } from '../global-action';
import { BitcoinKeychainStore } from '../keychains/bitcoin/bitcoin-keychains.slice';
import { handleEntityActionWith, makeAccountIdentifer } from '../utils';

export interface AccountStore {
  id: string;
  name?: string;
  ofKeychains: string[];
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
        // A new wallet always starts with account index 0
        const id = makeAccountIdentifer(action.payload.wallet.fingerprint, 0);
        const ofKeychains = action.payload.withKeychains.bitcoin.map(k =>
          extractKeyOriginPathFromDescriptor(k.descriptor)
        );
        adapter.addOne(state, { id, ofKeychains });
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
        removesAccount,
        handleEntityActionWith(adapter.removeOne, payload =>
          makeAccountIdentifer(payload.fingerprint, payload.accountIndex)
        )
      )

      .addCase(...handleAppResetWithState(initialState)),
});

interface AddAccountPayload {
  account: AccountStore;
  withKeychains: {
    bitcoin: BitcoinKeychainStore[];
  };
}
export const userAddsAccount = createAction<AddAccountPayload>('accounts/userAddsAccount');

interface RemoveAccountPayload {
  fingerprint: string;
  accountIndex: number;
}
export const removesAccount = createAction<RemoveAccountPayload>('accounts/removeAccount');
