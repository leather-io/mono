import { PersistConfig } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import type { RootState } from '@app/store';

import { migrations } from './migrations/migrations';
import { storage } from './storage-driver';

export async function clearChromeStorage(): Promise<void> {
  return new Promise(resolve => chrome.storage.local.clear(resolve));
}

interface UntypedDeserializeOption {
  deserialize?: boolean;
}
export const persistConfig: PersistConfig<RootState> & UntypedDeserializeOption = {
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
    'ordinals',
    'softwareKeys',
    'appPermissions',
    'ledger',
    'networks',
    'onboarding',
    'settings',
    'wallet',
    'manageTokens',
  ],
};
