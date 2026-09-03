import { PayloadAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { resetWallet } from '@leather.io/state';
import { fingerprintMigration, userRemovesWallet } from '@leather.io/state/wallet';

import { type PlatformUnlockConfig, isPlatformUnlockConfig } from '@shared/crypto/platform-unlock';
import { assumedZeroFingerprint } from '@shared/utils';

import { migrateVaultReducerStoreToNewStateStructure } from '../utils/vault-reducer-migration';

export type WalletAuthenticationMode = 'biometric-only' | 'password';

export interface SoftwareKeyConfig {
  type: 'software';
  id: string;
  encryptedSecretKey: string;
}

interface SoftwareKeyAuthenticationState {
  authenticationMode?: WalletAuthenticationMode;
  platformUnlock?: PlatformUnlockConfig;
  salt?: string;
}

export const keyAdapter = createEntityAdapter<SoftwareKeyConfig>();

export const initialKeysState = keyAdapter.getInitialState<SoftwareKeyAuthenticationState>({});

export const keySlice = createSlice({
  name: 'softwareKeys',
  initialState: migrateVaultReducerStoreToNewStateStructure(initialKeysState),
  reducers: {
    createSoftwareWalletComplete(
      state,
      action: PayloadAction<{ salt: string; key: SoftwareKeyConfig }>
    ) {
      if (state.authenticationMode === 'biometric-only') return;
      keyAdapter.upsertOne(state, action.payload.key);
      state.salt = action.payload.salt;
      state.authenticationMode = 'password';
      delete state.platformUnlock;
    },

    createBiometricSoftwareWalletComplete(
      state,
      action: PayloadAction<{ key: SoftwareKeyConfig; platformUnlock: PlatformUnlockConfig }>
    ) {
      if (
        state.ids.length > 0 ||
        state.authenticationMode !== undefined ||
        state.platformUnlock !== undefined ||
        state.salt !== undefined ||
        !isPlatformUnlockConfig(action.payload.platformUnlock)
      ) {
        return;
      }
      keyAdapter.addOne(state, action.payload.key);
      delete state.salt;
      state.authenticationMode = 'biometric-only';
      state.platformUnlock = action.payload.platformUnlock;
    },

    addNewWallet(state, action: PayloadAction<SoftwareKeyConfig>) {
      keyAdapter.addOne(state, action.payload);
    },

    // Persists the result of re-encrypting a legacy (pre-Argon2 / vault-migrated)
    // key at unlock. upsertOne overwrites the existing entity's encryptedSecretKey
    // in place rather than adding a new one — the key already exists, only its
    // ciphertext (and the shared top-level salt) changed.
    softwareKeyReEncrypted(state, action: PayloadAction<{ salt: string; key: SoftwareKeyConfig }>) {
      if (state.authenticationMode === 'biometric-only') return;
      keyAdapter.upsertOne(state, action.payload.key);
      state.salt = action.payload.salt;
      state.authenticationMode = 'password';
      delete state.platformUnlock;
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
      .addCase(userRemovesWallet, (state, action) => {
        keyAdapter.removeOne(state, action.payload.fingerprint);
        if (state.ids.length > 0) return;
        delete state.authenticationMode;
        delete state.platformUnlock;
        delete state.salt;
      })
      .addCase(resetWallet, state => {
        delete state.authenticationMode;
        delete state.platformUnlock;
        delete state.salt;
        keyAdapter.removeAll(state);
      }),
});
