import * as SecureStore from 'expo-secure-store';

import { type StoreKeys } from './secure-store-keys';
import { getBasicSecureStoreConfig } from './utils';

export async function searchForMnemonic(secureStoreKeys: StoreKeys[]) {
  let foundMnemonic: string | null = null;
  let foundPassphrase: string | null = null;
  let foundStoreKeys: StoreKeys | null = null;
  // Start with the latest version and work your way down.
  const storeKeysReverse = secureStoreKeys.reverse();

  for (let i = 0; i < storeKeysReverse.length; ++i) {
    const storeKeys = storeKeysReverse[i];
    if (storeKeys) {
      const mnemonic = await SecureStore.getItemAsync(
        storeKeys.mnemonicStoreKey,
        getBasicSecureStoreConfig()
      );
      const passphrase = await SecureStore.getItemAsync(
        storeKeys.passphraseStoreKey,
        getBasicSecureStoreConfig()
      );
      if (mnemonic) {
        foundMnemonic = mnemonic;
        foundPassphrase = passphrase;
        foundStoreKeys = storeKeys;
        break;
      }
    }
  }
  return {
    mnemonic: foundMnemonic,
    passphrase: foundPassphrase,
    storeKeys: foundStoreKeys,
  };
}
