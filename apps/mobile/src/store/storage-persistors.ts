import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistConfig, createMigrate } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import type { RootState } from '.';
import { migrations } from './migrations';

export const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  stateReconciler: autoMergeLevel2,
  version: 2,
  storage: AsyncStorage,
  migrate: createMigrate(migrations, { debug: process.env.NODE_ENV === 'development' }),
  whitelist: ['wallets', 'accounts', 'keychains', 'settings', 'apps'],
};
