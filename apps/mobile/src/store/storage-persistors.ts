import { isDevelopment } from '@/shared/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type PersistConfig, createMigrate } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import { migrations } from './migrations/migrations';
import { type RootState } from './store';

export const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  stateReconciler: autoMergeLevel2,
  version: 2,
  storage: AsyncStorage,
  migrate: createMigrate(migrations, { debug: isDevelopment() }),
  whitelist: ['wallets', 'accounts', 'keychains', 'settings', 'apps'],
};
