import { PersistConfig } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import type { LocalRootState } from '@app/store';

import { migrations } from './migrations/migrations';
import { storage } from './storage-driver';

export async function clearChromeStorage(): Promise<void> {
  return new Promise(resolve => chrome.storage.local.clear(resolve));
}

interface HiddenUntypeDeserializeOption {
  deserialize?: boolean;
}
export const persistConfig: PersistConfig<LocalRootState> & HiddenUntypeDeserializeOption = {
  key: 'root',
  stateReconciler: autoMergeLevel2,
  version: 3,
  storage,
  serialize: false,
  migrate: migrations,
  deserialize: false,
  whitelist: [
    'active',
    'analytics',
    'chains',
    'softwareKeys',
    'appPermissions',
    'ledger',
    'networks',
    'settings',
    'wallets',
    'manageTokens',
  ],
};
