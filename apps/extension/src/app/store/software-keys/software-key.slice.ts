import { PayloadAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { resetWallet } from '@leather.io/state';
import { fingerprintMigration, userRemovesWallet } from '@leather.io/state/wallet';

import { assumedZeroFingerprint } from '@shared/utils';

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

    // Persists the result of re-encrypting a legacy (pre-Argon2 / vault-migrated)
    // key at unlock. upsertOne overwrites the existing entity's encryptedSecretKey
    // in place rather than adding a new one — the key already exists, only its
    // ciphertext (and the shared top-level salt) changed.
    softwareKeyReEncrypted(state, action: PayloadAction<{ salt: string; key: SoftwareKeyConfig }>) {
      keyAdapter.upsertOne(state, action.payload.key);
      state.salt = action.payload.salt;
    },
  },
  extraReducers: builder =>
    builder
      .addCase(fingerprintMigration, (state, action) => {
        const newFingerprint = action.payload;

        const existingKey = state.entities[assumedZeroFingerprint];
        if (existingKey) {
          keyAdapter.removeOne(state, assumedZeroFingerprint);
          keyAdapter.addOne(state, { ...existingKey, id: newFingerprint });
        }
      })
      .addCase(userRemovesWallet, (state, action) =>
        keyAdapter.removeOne(state, action.payload.fingerprint)
      )
      .addCase(resetWallet, state => {
        if (state.salt) delete state.salt;
        return keyAdapter.removeAll(state);
      }),
});
