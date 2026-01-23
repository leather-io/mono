import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { getMnemonicRootKeyFingerprint } from '@leather.io/crypto';

import { logger } from '@shared/logger';
import { encodeText } from '@shared/utils/text-encoding';

import { keySlice } from '../software-keys/software-key.slice';

interface InMemoryKeyState {
  hasRestoredKeys: boolean;
  keys: Record<string, string>;
}

const initialState: InMemoryKeyState = {
  hasRestoredKeys: false,
  keys: {},
};

export const inMemoryKeySlice = createSlice({
  name: 'inMemoryKey',
  initialState,

  reducers: {
    generateWalletKey(state, action: PayloadAction<string>) {
      const fingerprint = getMnemonicRootKeyFingerprint(action.payload);

      if (state.keys[fingerprint]) {
        logger.warn('Not generating another wallet, already exists.');
        return;
      }

      state.keys[fingerprint] = encodeText(action.payload);
    },

    setWalletKeys(state, action: PayloadAction<{ fingerprint: string; secretKey: string }[]>) {
      state.keys = {
        ...state.keys,
        ...Object.fromEntries(action.payload.map(k => [k.fingerprint, encodeText(k.secretKey)])),
      };
    },

    lockWallet(state) {
      state.keys = {};
    },
  },

  extraReducers: builder => {
    builder.addCase(keySlice.actions.signOut, state => {
      state.keys = {};
    });
  },
});
