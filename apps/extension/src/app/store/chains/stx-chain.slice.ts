import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { userAddsWallet } from '@leather.io/state/wallet';

import { keySlice } from '../software-keys/software-key.slice';

interface StxChainKeyState {
  highestAccountIndex: number;
  currentAccountStacksDescriptor: string;
}

const initialState: Record<string, StxChainKeyState> = {};

export const stxChainSlice = createSlice({
  name: 'stxChain',
  initialState,

  reducers: {
    createNewAccount(state, action: PayloadAction<{ fingerprint: string; descriptor: string }>) {
      state[action.payload.fingerprint].highestAccountIndex += 1;
      state[action.payload.fingerprint].currentAccountStacksDescriptor = action.payload.descriptor;
    },

    restoreAccountIndex(state, action: PayloadAction<number>) {
      state.default.highestAccountIndex = action.payload;
    },
  },

  extraReducers: builder =>
    builder
      .addCase(keySlice.actions.signOut, () => ({}))

      .addCase(userAddsWallet, (state, action) => {
        state[action.payload.wallet.fingerprint] = {
          highestAccountIndex: 0,
          currentAccountStacksDescriptor: '',
        };
      }),
});
