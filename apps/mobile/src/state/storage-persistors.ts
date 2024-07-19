import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { rememberEnhancer } from 'redux-remember';

import { RootState } from '.';

export function createAsyncStorageEnhancer(reducersToPersist: (keyof RootState)[]) {
  return rememberEnhancer(AsyncStorage, reducersToPersist, {
    prefix: 'leatherAsync',
  });
}

// Mnemonics are accessed directly from SecureStore to avoid leaving them in the
// app state. Read the key only at the time it is needed for signing.
export function mnemonicStore(fingerprint: string) {
  const passphraseKey = `${fingerprint}_passphrase`;
  return {
    async getMnemonic(passphrase?: string) {
      const mnemonic = await SecureStore.getItemAsync(fingerprint);
      if (passphrase) {
        const passphrase = (await SecureStore.getItemAsync(passphraseKey)) ?? undefined;
        return { mnemonic, passphrase };
      }
      return { mnemonic };
    },
    async setMnemonic(mnemonic: string, passphrase?: string) {
      if (passphrase) await SecureStore.setItemAsync(passphraseKey, passphrase);
      return SecureStore.setItemAsync(fingerprint, mnemonic);
    },
    async deleteMnemonic() {
      return Promise.all([
        SecureStore.deleteItemAsync(fingerprint),
        SecureStore.deleteItemAsync(passphraseKey),
      ]);
    },
  };
}
