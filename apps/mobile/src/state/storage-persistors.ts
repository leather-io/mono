import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { PersistConfig } from 'redux-persist';
import { z } from 'zod';

import { RootState } from '.';

export const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  version: 0,
  storage: AsyncStorage,
  whitelist: ['wallets', 'accounts', 'keychains', 'settings'],
};

const secureStoreConfig: SecureStore.SecureStoreOptions = {
  authenticationPrompt: "Allow Leather to access application's secure storage",
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};
const secureStoreConfigWithBiometrics = {
  ...secureStoreConfig,
  requireAuthentication: true,
};

function getSecureStoreConfig(biometrics: boolean) {
  if (biometrics) {
    return secureStoreConfigWithBiometrics;
  }
  return secureStoreConfig;
}

const mnemonicSchema = z.object({
  mnemonic: z.string(),
  passphrase: z.string().optional(),
});
export type Mnemonic = z.infer<typeof mnemonicSchema>;

export function deleteAllMnemonics(fingerprintArr: string[]) {
  return Promise.all(
    fingerprintArr.map(fingerprint => mnemonicStore(fingerprint).deleteMnemonic())
  );
}

const TEMPORARY_MNEMONIC_KEY = 'TEMPORARY_MNEMONIC_KEY';
const TEMPORARY_MNEMONIC_KEY_PASSPHRASE = 'TEMPORARY_MNEMONIC_KEY_PASSPHRASE';

export const tempMnemonicStore = {
  async setTemporaryMnemonic(tempMnemonic: string, passphrase?: string) {
    if (passphrase) {
      await SecureStore.setItemAsync(
        TEMPORARY_MNEMONIC_KEY_PASSPHRASE,
        passphrase,
        secureStoreConfig
      );
    }

    return SecureStore.setItemAsync(TEMPORARY_MNEMONIC_KEY, tempMnemonic, secureStoreConfig);
  },
  async getTemporaryMnemonic() {
    // Whenever you get a value from the store, delete that value from the store
    const mnemonic = await SecureStore.getItemAsync(TEMPORARY_MNEMONIC_KEY, secureStoreConfig);
    const passphrase = await SecureStore.getItemAsync(
      TEMPORARY_MNEMONIC_KEY_PASSPHRASE,
      secureStoreConfig
    );
    await this.deleteTemporaryMnemonic();
    return { mnemonic, passphrase };
  },
  async deleteTemporaryMnemonic() {
    await SecureStore.deleteItemAsync(TEMPORARY_MNEMONIC_KEY, secureStoreConfig);
    return SecureStore.deleteItemAsync(TEMPORARY_MNEMONIC_KEY, secureStoreConfig);
  },
};

interface MnemonicStore {
  getMnemonic(passphrase?: string): Promise<Mnemonic>;
  setMnemonic(params: {
    mnemonic: string;
    passphrase?: string;
    biometrics: boolean;
  }): Promise<unknown>;
  deleteMnemonic(): Promise<unknown>;
}

// On iOS, secure store only prompts for biometrics when we read or update the existing value.
// Ref: https://docs.expo.dev/versions/latest/sdk/securestore/#securestoreoptions
//
// Mnemonics are accessed directly from SecureStore to avoid leaving them in the
// app state. Read the key only at the time it is needed for signing.
export function mnemonicStore(fingerprint: string): MnemonicStore {
  const passphraseKey = `${fingerprint}_passphrase`;
  return {
    async getMnemonic(passphrase) {
      const mnemonic = await SecureStore.getItemAsync(fingerprint, secureStoreConfig);
      if (passphrase) {
        const passphrase =
          (await SecureStore.getItemAsync(passphraseKey, secureStoreConfig)) ?? undefined;
        return mnemonicSchema.parse({ mnemonic, passphrase });
      }
      return mnemonicSchema.parse({ mnemonic });
    },
    async setMnemonic({ mnemonic, passphrase, biometrics }) {
      if (passphrase)
        await SecureStore.setItemAsync(passphraseKey, passphrase, getSecureStoreConfig(biometrics));
      return SecureStore.setItemAsync(fingerprint, mnemonic, getSecureStoreConfig(biometrics));
    },
    async deleteMnemonic() {
      return Promise.all([
        SecureStore.deleteItemAsync(fingerprint, secureStoreConfig),
        SecureStore.deleteItemAsync(passphraseKey, secureStoreConfig),
      ]);
    },
  };
}
