import { PersistConfig } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import type { LocalRootState } from '@app/store';

import { mergePersistStorage } from './merge-persist-storage';
import { migrations } from './migrations/migrations';
import { persistWhitelist } from './persist-whitelist';

export async function clearChromeStorage(): Promise<void> {
  return new Promise(resolve => chrome.storage.local.clear(resolve));
}

interface HiddenUntypeDeserializeOption {
  deserialize?: boolean;
}
export const persistConfig: PersistConfig<LocalRootState> & HiddenUntypeDeserializeOption = {
  key: 'root',
  stateReconciler: autoMergeLevel2,
  version: 4,
  storage: mergePersistStorage,
  serialize: false,
  migrate: migrations,
  deserialize: false,
  whitelist: [...persistWhitelist],
};
