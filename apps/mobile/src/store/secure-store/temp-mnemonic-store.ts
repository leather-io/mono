import * as SecureStore from 'expo-secure-store';

import { getBasicSecureStoreConfig } from './utils';

const TEMPORARY_MNEMONIC_KEY = 'TEMPORARY_MNEMONIC_KEY';
const TEMPORARY_MNEMONIC_KEY_PASSPHRASE = 'TEMPORARY_MNEMONIC_KEY_PASSPHRASE';

export const tempMnemonicStore = {
  async setTemporaryMnemonic(tempMnemonic: string, passphrase?: string) {
    if (passphrase) {
      await SecureStore.setItemAsync(
        TEMPORARY_MNEMONIC_KEY_PASSPHRASE,
        passphrase,
        getBasicSecureStoreConfig()
      );
    }

    return SecureStore.setItemAsync(
      TEMPORARY_MNEMONIC_KEY,
      tempMnemonic,
      getBasicSecureStoreConfig()
    );
  },
  async getTemporaryMnemonic() {
    // Whenever you get a value from the store, delete that value from the store
    const mnemonic = await SecureStore.getItemAsync(
      TEMPORARY_MNEMONIC_KEY,
      getBasicSecureStoreConfig()
    );
    const passphrase = await SecureStore.getItemAsync(
      TEMPORARY_MNEMONIC_KEY_PASSPHRASE,
      getBasicSecureStoreConfig()
    );
    return { mnemonic, passphrase };
  },
  async deleteTemporaryMnemonic() {
    await SecureStore.deleteItemAsync(TEMPORARY_MNEMONIC_KEY, getBasicSecureStoreConfig());
    return SecureStore.deleteItemAsync(
      TEMPORARY_MNEMONIC_KEY_PASSPHRASE,
      getBasicSecureStoreConfig()
    );
  },
};
