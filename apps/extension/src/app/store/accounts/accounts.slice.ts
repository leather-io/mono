import { createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { handleAppResetWithState } from '@leather.io/state';
import { userAddsAccount } from '@leather.io/state/keychains';
import { userAddsWallet, userRemovesWallet } from '@leather.io/state/wallet';

import { AccountStatus, AccountStore } from './account-store.utils';

export const accountsAdapter = createEntityAdapter<AccountStore, string>({
  selectId: account => account.id,
});

const initialState = accountsAdapter.getInitialState();

interface RenameAccountPayload {
  accountId: string;
  name: string;
}
// Note: a distinct action type from `userRenamesWallet` (which uses the
// `accounts/renameAccount` type) to avoid the cross-slice collision that exists
// in mobile today. To be reconciled when these slices move to the shared package.
export const userRenamesAccount = createAction<RenameAccountPayload>('accounts/userRenamesAccount');

interface ToggleHideAccountPayload {
  accountId: string;
}
export const userTogglesHideAccount = createAction<ToggleHideAccountPayload>(
  'accounts/userTogglesHideAccount'
);

export const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      // Provision the first account when a wallet is added
      .addCase(userAddsWallet, (state, action) => {
        const id = makeAccountIdentifer(action.payload.wallet.fingerprint, 0);
        accountsAdapter.addOne(state, { id });
      })

      .addCase(userAddsAccount, (state, action) => {
        accountsAdapter.addOne(state, { id: action.payload.account.id });
      })

      // Removing a wallet cascades to all of its accounts and their metadata
      .addCase(userRemovesWallet, (state, action) => {
        const prefix = `${action.payload.fingerprint}/`;
        const accountIds = state.ids.filter(id => String(id).startsWith(prefix));
        accountsAdapter.removeMany(state, accountIds);
      })

      // `upsertOne` (rather than mobile's `updateOne`) so renaming/hiding works
      // for accounts the extension derives lazily (e.g. those materialized by
      // activity restoration) that may not yet have an entity row
      .addCase(userRenamesAccount, (state, action) => {
        const { accountId, name } = action.payload;
        accountsAdapter.upsertOne(state, { id: accountId, name });
      })

      .addCase(userTogglesHideAccount, (state, action) => {
        const { accountId } = action.payload;
        const isHidden = state.entities[accountId]?.status === 'hidden';
        const status: AccountStatus = isHidden ? 'active' : 'hidden';
        accountsAdapter.upsertOne(state, { id: accountId, status });
      })

      .addCase(...handleAppResetWithState(initialState)),
});
