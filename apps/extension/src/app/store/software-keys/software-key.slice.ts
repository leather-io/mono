import { PayloadAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { migrateVaultReducerStoreToNewStateStructure } from '../utils/vault-reducer-migration';

interface SoftwareKeyConfig {
  type: 'software';
  id: string;
  encryptedSecretKey: string;
}
export const keyAdapter = createEntityAdapter<SoftwareKeyConfig>();

export const initialKeysState = keyAdapter.getInitialState<{ salt?: string }>({});

export const keySlice = createSlice({
  name: 'softwareKeys',
  initialState: migrateVaultReducerStoreToNewStateStructure(initialKeysState),
  reducers: {
    createSoftwareWalletComplete(
      state,
      action: PayloadAction<{ salt: string; key: SoftwareKeyConfig }>
    ) {
      keyAdapter.upsertOne(state, action.payload.key);
      state.salt = action.payload.salt;
    },

    addNewWallet(state, action: PayloadAction<SoftwareKeyConfig>) {
      keyAdapter.addOne(state, action.payload);
    },

    signOut(state) {
      if (state.salt) delete state.salt;
      return keyAdapter.removeAll(state);
    },
  },
});
