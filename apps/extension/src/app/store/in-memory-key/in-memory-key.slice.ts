import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { logger } from '@shared/logger';
import { defaultWalletKeyId } from '@shared/utils';
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
      if (state.keys[defaultWalletKeyId]) {
        logger.warn('Not generating another wallet, already exists.');
        return;
      }

      state.keys[defaultWalletKeyId] = encodeText(action.payload);
    },

    setWalletKeys(state, action: PayloadAction<Record<string, string>>) {
      state.keys = {
        ...state.keys,
        ...Object.entries(action.payload).reduce(
          (acc, [keyId, secretKey]) => {
            acc[keyId] = encodeText(secretKey);
            return acc;
          },
          {} as Record<string, string>
        ),
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
