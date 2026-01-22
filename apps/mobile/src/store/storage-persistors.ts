import { useEffect, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistConfig, createMigrate } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import { RootState } from '.';
import { migrations } from './migrations';
import { mnemonicStore } from './secure-store/mnemonic-store';

export const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  stateReconciler: autoMergeLevel2,
  version: 2,
  storage: AsyncStorage,
  migrate: createMigrate(migrations, { debug: process.env.NODE_ENV === 'development' }),
  whitelist: ['wallets', 'accounts', 'keychains', 'settings', 'apps'],
};

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
