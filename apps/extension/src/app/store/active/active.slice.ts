import { createAction, createSlice } from '@reduxjs/toolkit';

import { AccountId } from '@leather.io/models';
import { resetWallet } from '@leather.io/state';
import { fingerprintMigration } from '@leather.io/state/wallet';

import { assumedZeroFingerprint } from '@shared/utils';

export const userSwitchesAccount = createAction<AccountId | null>('active/userSwitchesAccount');
export const walletKeyGenerated = createAction<string>('active/walletKeyGenerated');

interface ActiveState {
  account: AccountId | null;
}

const initialState: ActiveState = { account: null };

export const activeSlice = createSlice({
  name: 'active',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(resetWallet, state => {
        state.account = null;
      })
      .addCase(userSwitchesAccount, (state, action) => {
        state.account = action.payload;
      })
      .addCase(walletKeyGenerated, (state, action) => {
        state.account = {
          fingerprint: action.payload,
          accountIndex: 0,
        };
      })
      .addCase(fingerprintMigration, (state, action) => {
        if (!state.account) return;
        const newFingerprint = action.payload;
        if (state.account.fingerprint === assumedZeroFingerprint) {
          state.account = { ...state.account, fingerprint: newFingerprint };
        }
      }),
});
