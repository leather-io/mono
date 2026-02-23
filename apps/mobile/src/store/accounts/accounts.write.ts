import { createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { AccountId } from '@leather.io/models';
import { handleAppResetWithState, handleEntityActionWith } from '@leather.io/state';
import { userAddsAccount } from '@leather.io/state/keychains';
import { userAddsWallet, userRemovesWallet } from '@leather.io/state/wallet';

import { AccountIcon, AccountStatus, AccountStore } from './utils';

export const accountsAdapter = createEntityAdapter<AccountStore, string>({
  selectId: account => account.id,
});
const initialState = accountsAdapter.getInitialState();

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

        accountsAdapter.addOne(state, { id });
      })

      .addCase(userRemovesWallet, (state, action) => {
        const fingerprint = action.payload.fingerprint;
        const accountIds = state.ids.filter(id => id.startsWith(fingerprint));
        accountsAdapter.removeMany(state, accountIds);
      })

      .addCase(userAddsAccount, (state, action) => {
        return accountsAdapter.addOne(state, {
          id: action.payload.account.id,
        });
      })

      .addCase(
        userTogglesHideAccount,
        handleEntityActionWith(accountsAdapter.updateOne, (payload, state) => {
          let newStatus: AccountStatus = 'active' as const;
          if (state.entities[payload.accountId]?.status === 'active') {
            newStatus = 'hidden' as const;
          }
          return {
            id: payload.accountId,
            changes: { status: newStatus } as const,
          };
        })
      )

      .addCase(
        userRenamesAccount,
        handleEntityActionWith(accountsAdapter.updateOne, payload => ({
          id: payload.accountId,
          changes: { name: payload.name },
        }))
      )

      .addCase(
        userUpdatesAccountIcon,
        handleEntityActionWith(accountsAdapter.updateOne, payload => ({
          id: makeAccountIdentifer(payload.fingerprint, payload.accountIndex),
          changes: { icon: payload.icon },
        }))
      )

      .addCase(...handleAppResetWithState(initialState)),
});

interface ToggleHideAccountPayload {
  accountId: string;
}
export const userTogglesHideAccount = createAction<ToggleHideAccountPayload>(
  'accounts/toggleHideAccount'
);

interface RenameAccountPayload {
  name: string;
  accountId: string;
}
export const userRenamesAccount = createAction<RenameAccountPayload>('accounts/renameAccount');

interface UpdateAccountIconPayload extends AccountId {
  icon: AccountIcon;
}
export const userUpdatesAccountIcon = createAction<UpdateAccountIconPayload>(
  'accounts/addIconToAccount'
);
