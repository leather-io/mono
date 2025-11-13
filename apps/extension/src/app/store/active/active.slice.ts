import { createAction, createSlice } from '@reduxjs/toolkit';

import { AccountId } from '@leather.io/models';

import { stxChainSlice } from '../chains/stx-chain.slice';

export const userSwitchesAccount = createAction<AccountId>('active/userSwitchesAccount');

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
      .addCase(userSwitchesAccount, (state, action) => {
        state.account = action.payload;
      })
      .addCase(stxChainSlice.actions.createNewAccount, (_state, _action) => {
        // When a new account is created, switch to it
        // TODO: implement account switching on account creation
      }),
});
