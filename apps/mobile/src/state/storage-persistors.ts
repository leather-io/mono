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
  requireAuthentication: true,
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

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
// Mnemonics are accessed directly from SecureStore to avoid leaving them in the
// app state. Read the key only at the time it is needed for signing.
export function mnemonicStore(fingerprint: string) {
  const passphraseKey = `${fingerprint}_passphrase`;
  return {
    async getMnemonic(passphrase?: string): Promise<Mnemonic> {
      const mnemonic = await SecureStore.getItemAsync(fingerprint, secureStoreConfig);
      if (passphrase) {
        const passphrase =
          (await SecureStore.getItemAsync(passphraseKey, secureStoreConfig)) ?? undefined;
        return mnemonicSchema.parse({ mnemonic, passphrase });
      }
      return mnemonicSchema.parse({ mnemonic });
    },
    async setMnemonic(mnemonic: string, passphrase?: string) {
      if (passphrase) await SecureStore.setItemAsync(passphraseKey, passphrase, secureStoreConfig);
      return SecureStore.setItemAsync(fingerprint, mnemonic, secureStoreConfig);
    },
    async deleteMnemonic() {
      return Promise.all([
        SecureStore.deleteItemAsync(fingerprint, secureStoreConfig),
        SecureStore.deleteItemAsync(passphraseKey, secureStoreConfig),
      ]);
    },
  };
}
