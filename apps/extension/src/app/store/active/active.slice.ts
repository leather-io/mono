import { createAction, createSlice } from '@reduxjs/toolkit';

import { getMnemonicRootKeyFingerprint } from '@leather.io/crypto';
import { AccountId } from '@leather.io/models';
import { resetWallet } from '@leather.io/state';
import { fingerprintMigration } from '@leather.io/state/wallet';

import { assumedZeroFingerprint } from '@shared/utils';

import { inMemoryKeySlice } from '../in-memory-key/in-memory-key.slice';

export const userSwitchesAccount = createAction<AccountId | null>('active/userSwitchesAccount');

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
      .addCase(inMemoryKeySlice.actions.generateWalletKey, (state, action) => {
        state.account = {
          fingerprint: getMnemonicRootKeyFingerprint(action.payload),
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
