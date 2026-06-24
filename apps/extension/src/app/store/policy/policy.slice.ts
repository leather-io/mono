import { createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { handleAppResetWithState } from '@leather.io/state';
import { userRemovesWallet } from '@leather.io/state/wallet';

import { PolicyStore } from './policy-store.utils';

const policyAdapter = createEntityAdapter<PolicyStore, string>({
  selectId: policy => policy.id,
});

const initialState = policyAdapter.getInitialState();

interface AddPolicyAccountPayload {
  policy: PolicyStore;
  name?: string;
}

export const userAddsPolicyAccount = createAction<AddPolicyAccountPayload>(
  'policy/userAddsPolicyAccount'
);

export const policySlice = createSlice({
  name: 'policy',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      // `upsertOne` so re-adding the same (parent, address) policy account is
      // idempotent — a second registration replaces the existing row in place.
      .addCase(userAddsPolicyAccount, (state, action) => {
        policyAdapter.upsertOne(state, action.payload.policy);
      })

      // Removing a wallet cascades to its policy accounts. Their ids start with
      // `${fingerprint}/` (parentAccountId is `${fingerprint}/${accountIndex}`),
      // so the same prefix match the accounts slice uses works here too. No
      // `fingerprintMigration` re-keying is needed: a policy account is only
      // created by an unlocked, real-fingerprint account, never under the
      // assumed-zero fingerprint.
      .addCase(userRemovesWallet, (state, action) => {
        const prefix = `${action.payload.fingerprint}/`;
        const policyIds = state.ids.filter(id => String(id).startsWith(prefix));
        policyAdapter.removeMany(state, policyIds);
      })

      .addCase(...handleAppResetWithState(initialState)),
});
