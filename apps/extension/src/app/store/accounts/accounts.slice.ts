import { createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { handleAppResetWithState } from '@leather.io/state';
import { userAddsAccount } from '@leather.io/state/keychains';
import { fingerprintMigration, userAddsWallet, userRemovesWallet } from '@leather.io/state/wallet';

import { assumedZeroFingerprint } from '@shared/utils';

import { userAddsPolicyAccount } from '../policy/policy.slice';
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

interface ClearAccountNamePayload {
  accountId: string;
}
export const userClearsAccountName = createAction<ClearAccountNamePayload>(
  'accounts/userClearsAccountName'
);

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

      .addCase(userAddsPolicyAccount, (state, action) => {
        const { policy, name } = action.payload;
        const status: AccountStatus = 'active';
        accountsAdapter.upsertOne(state, { id: policy.id, name, status });
      })

      // Removing a wallet cascades to all of its accounts and their metadata
      .addCase(userRemovesWallet, (state, action) => {
        const prefix = `${action.payload.fingerprint}/`;
        const accountIds = state.ids.filter(id => String(id).startsWith(prefix));
        accountsAdapter.removeMany(state, accountIds);
      })

      // Re-key accounts from the assumed-zero fingerprint to the real one,
      // preserving name/status. Must run before the migration's
      // `userRemovesWallet('00000000')` so the cascade above finds nothing to delete
      .addCase(fingerprintMigration, (state, action) => {
        const newFingerprint = action.payload;
        const prefix = `${assumedZeroFingerprint}/`;
        const legacyIds = state.ids.filter(id => String(id).startsWith(prefix));

        for (const legacyId of legacyIds) {
          const account = state.entities[legacyId];
          if (!account) continue;
          const accountIndex = Number(String(legacyId).slice(prefix.length));
          accountsAdapter.removeOne(state, legacyId);
          accountsAdapter.addOne(state, {
            ...account,
            id: makeAccountIdentifer(newFingerprint, accountIndex),
          });
        }
      })

      // `upsertOne` (rather than mobile's `updateOne`) so renaming/hiding works
      // for accounts the extension derives lazily (e.g. those materialized by
      // activity restoration) that may not yet have an entity row
      .addCase(userRenamesAccount, (state, action) => {
        const { accountId, name } = action.payload;
        accountsAdapter.upsertOne(state, { id: accountId, name });
      })

      // Clearing the custom name reverts display to the BNS name (or "Account N").
      // Preserve any other metadata (status); otherwise drop the row entirely
      .addCase(userClearsAccountName, (state, action) => {
        const { accountId } = action.payload;
        const account = state.entities[accountId];
        if (!account) return;
        if (account.status) {
          accountsAdapter.setOne(state, { id: accountId, status: account.status });
        } else {
          accountsAdapter.removeOne(state, accountId);
        }
      })

      .addCase(userTogglesHideAccount, (state, action) => {
        const { accountId } = action.payload;
        const isHidden = state.entities[accountId]?.status === 'hidden';
        const status: AccountStatus = isHidden ? 'active' : 'hidden';
        accountsAdapter.upsertOne(state, { id: accountId, status });
      })

      .addCase(...handleAppResetWithState(initialState)),
});
