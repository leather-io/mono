import * as SecureStore from 'expo-secure-store';

import { safelyReadPaddedFingerprint } from '@leather.io/crypto';

import { store } from '..';
import { selectSecurityLevelPreference } from '../settings/settings.read';
import { searchForMnemonic } from './secure-store-access';
import { getLatestStoreKeys, getSecureStoreKeys } from './secure-store-keys';
import {
  type Mnemonic,
  getBasicSecureStoreConfig,
  getSecureStoreConfig,
  mnemonicSchema,
} from './utils';

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
  const paddedFingerprint = safelyReadPaddedFingerprint(fingerprint);
  const secureStoreKeys = getSecureStoreKeys(paddedFingerprint);
  const latestStoreKeys = getLatestStoreKeys(secureStoreKeys);

  async function setMnemonic({
    mnemonic,
    passphrase,
    biometrics,
  }: {
    mnemonic: string;
    passphrase?: string | null;
    biometrics: boolean;
  }) {
    if (passphrase)
      await SecureStore.setItemAsync(
        latestStoreKeys.passphraseStoreKey,
        passphrase,
        getSecureStoreConfig(biometrics)
      );
    await SecureStore.setItemAsync(
      latestStoreKeys.mnemonicStoreKey,
      mnemonic,
      getSecureStoreConfig(biometrics)
    );
  }

  async function getMnemonic() {
    const { mnemonic, passphrase, storeKeys } = await searchForMnemonic(secureStoreKeys);
    if (!storeKeys || !mnemonic) {
      // we need to error out here somehow
      throw new Error('No mnemonic was found');
    }
    if (storeKeys.mnemonicStoreKey !== latestStoreKeys.mnemonicStoreKey) {
      // NOTE: yea not nice, we technically shouldn't be using store here but
      // there is currently no way of knowing if the mnemonic is already set with biometrics or not
      const securityLevelPreference = selectSecurityLevelPreference(store.getState());
      await setMnemonic({ mnemonic, passphrase, biometrics: securityLevelPreference === 'secure' });
    }

    const release: Partial<Mnemonic> = {};

    if (mnemonic) release.mnemonic = mnemonic;
    if (passphrase) release.passphrase = passphrase;

    return mnemonicSchema.parse(release);
  }

  async function deleteMnemonic() {
    const promises = secureStoreKeys
      .map(storeKeys => {
        return [
          SecureStore.deleteItemAsync(storeKeys.mnemonicStoreKey, getBasicSecureStoreConfig()),
          SecureStore.deleteItemAsync(storeKeys.passphraseStoreKey, getBasicSecureStoreConfig()),
        ];
      })
      .flat();
    // purge them all
    return Promise.all(promises);
  }

  return {
    getMnemonic,
    setMnemonic,
    deleteMnemonic,
  };
}

export function deleteAllMnemonics(fingerprintArr: string[]) {
  return Promise.all(
    fingerprintArr.map(fingerprint => mnemonicStore(fingerprint).deleteMnemonic())
  );
}
