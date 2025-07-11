import { useEffect, useState } from 'react';

import { t } from '@lingui/macro';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { PersistConfig } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { z } from 'zod';

import { RootState, stateSchema } from '.';

export const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  stateReconciler: (inboundState, originalState, reducedState, config) => {
    try {
      // continue with automerge if state passes zod validation
      stateSchema.parse(inboundState);
      return autoMergeLevel2(inboundState, originalState, reducedState, config);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
      // set state on fire if zod doesn't pass (until release, we would need to implement migrations afterwards)
      return originalState;
    }
  },
  version: 0,
  storage: AsyncStorage,
  whitelist: ['wallets', 'accounts', 'keychains', 'settings', 'apps'],
};

function getBasicSecureStoreConfig() {
  const secureStoreConfig: SecureStore.SecureStoreOptions = {
    authenticationPrompt: t({
      id: 'authentication_prompt',
      message: 'Allow app to access secure storage',
    }),
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  };
  return secureStoreConfig;
}

function getBiometricsSecureStoreConfig() {
  const secureStoreConfigWithBiometrics = {
    ...getBasicSecureStoreConfig(),
    requireAuthentication: true,
  };
  return secureStoreConfigWithBiometrics;
}

function getSecureStoreConfig(biometrics: boolean) {
  if (biometrics) {
    return getBiometricsSecureStoreConfig();
  }
  return getBasicSecureStoreConfig();
}

const mnemonicSchema = z.object({
  mnemonic: z.string(),
  passphrase: z.string().optional(),
});
type Mnemonic = z.infer<typeof mnemonicSchema>;

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
    async getMnemonic() {
      const mnemonic = await SecureStore.getItemAsync(fingerprint, getBasicSecureStoreConfig());
      const passphrase =
        (await SecureStore.getItemAsync(passphraseKey, getBasicSecureStoreConfig())) ?? undefined;
      return mnemonicSchema.parse({ mnemonic, passphrase });
    },
    async setMnemonic({ mnemonic, passphrase, biometrics }) {
      if (passphrase)
        await SecureStore.setItemAsync(passphraseKey, passphrase, getSecureStoreConfig(biometrics));
      return SecureStore.setItemAsync(fingerprint, mnemonic, getSecureStoreConfig(biometrics));
    },
    async deleteMnemonic() {
      return Promise.all([
        SecureStore.deleteItemAsync(fingerprint, getBasicSecureStoreConfig()),
        SecureStore.deleteItemAsync(passphraseKey, getBasicSecureStoreConfig()),
      ]);
    },
  };
}

export function useMnemonic({
  fingerprint,
  shouldLoadOnInit = true,
}: {
  fingerprint: string;
  shouldLoadOnInit?: boolean;
}) {
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState<string | null>(null);
  async function getMnemonic() {
    const response = await mnemonicStore(fingerprint).getMnemonic();
    if (response.mnemonic) {
      setMnemonic(response.mnemonic);
    } else {
      throw new Error('No mnemonic found for this fingerprint');
    }

    if (response.passphrase) {
      setPassphrase(response.passphrase);
    }
  }
  useEffect(() => {
    if (shouldLoadOnInit) {
      void getMnemonic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { mnemonic, passphrase };
}
