import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import type { AccountId } from '@leather.io/models';
import { userAddsWallet } from '@leather.io/state/wallet';

import { assumedZeroFingerprint } from '@shared/utils';

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
      const fingerprint = action.payload.fingerprint;
      if (!state[fingerprint]) {
        state[fingerprint] = {
          highestAccountIndex: 1,
          currentAccountStacksDescriptor: action.payload.descriptor,
        };
      } else {
        state[fingerprint].highestAccountIndex += 1;
        state[fingerprint].currentAccountStacksDescriptor = action.payload.descriptor;
      }
    },

    restoreAccountIndex(state, action: PayloadAction<AccountId>) {
      const fingerprint = assumedZeroFingerprint;
      if (!state[fingerprint]) {
        state[fingerprint] = {
          highestAccountIndex: action.payload.accountIndex,
          currentAccountStacksDescriptor: '',
        };
      } else {
        state[fingerprint].highestAccountIndex = action.payload.accountIndex;
      }
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
