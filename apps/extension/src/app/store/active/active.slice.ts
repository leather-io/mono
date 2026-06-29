import { createAction, createSlice } from '@reduxjs/toolkit';

import { AccountId } from '@leather.io/models';
import { resetWallet } from '@leather.io/state';
import { fingerprintMigration, userRemovesWallet } from '@leather.io/state/wallet';

import { assumedZeroFingerprint } from '@shared/utils';

import { userRemovesPolicy } from '../policy/policy.slice';

export const userSwitchesAccount = createAction<AccountId | null>('active/userSwitchesAccount');
export const userSwitchesToPolicy = createAction<{ parent: AccountId; policyId: string }>(
  'active/userSwitchesToPolicy'
);
export const walletKeyGenerated = createAction<string>('active/walletKeyGenerated');

interface ActiveState {
  account: AccountId | null;
  activePolicyId: string | null;
}

const initialState: ActiveState = { account: null, activePolicyId: null };

export const activeSlice = createSlice({
  name: 'active',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(resetWallet, state => {
        state.account = null;
        state.activePolicyId = null;
      })
      .addCase(userSwitchesAccount, (state, action) => {
        state.account = action.payload;
        state.activePolicyId = null;
      })
      .addCase(userSwitchesToPolicy, (state, action) => {
        state.account = action.payload.parent;
        state.activePolicyId = action.payload.policyId;
      })
      .addCase(walletKeyGenerated, (state, action) => {
        state.account = {
          fingerprint: action.payload,
          accountIndex: 0,
        };
        state.activePolicyId = null;
      })
      .addCase(fingerprintMigration, (state, action) => {
        if (!state.account) return;
        const newFingerprint = action.payload;
        if (state.account.fingerprint === assumedZeroFingerprint) {
          state.account = { ...state.account, fingerprint: newFingerprint };
        }
      })
      .addCase(userRemovesWallet, (state, action) => {
        if (state.account?.fingerprint === action.payload.fingerprint) {
          state.account = null;
        }
        if (state.activePolicyId?.startsWith(`${action.payload.fingerprint}/`)) {
          state.activePolicyId = null;
        }
      })
      .addCase(userRemovesPolicy, (state, action) => {
        if (state.activePolicyId === action.payload.policyId) {
          state.activePolicyId = null;
        }
      }),
});
