import { isProduction } from '@/shared/environment';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import devToolsEnhancer from 'redux-devtools-expo-dev-plugin';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import z from 'zod';

import { keychainSlice } from '@leather.io/state';
import { walletEntitySchema, walletSlice } from '@leather.io/state/wallet';

import { accountEntitySchema, accountsSlice } from './accounts/accounts.write';
import { appsSlice } from './apps/apps.write';
// import { deleteAllMnemonics } from './secure-store/mnemonic-store';
import { settingsSlice } from './settings/settings.write';
import { settingsSchema } from './settings/utils';
import { persistConfig } from './storage-persistors';

export const stateSchema = z.object({
  wallets: walletEntitySchema,
  accounts: accountEntitySchema,
  keychains: z.looseObject({}),
  settings: settingsSchema,
});

const reducer = combineReducers({
  wallets: walletSlice.reducer,
  accounts: accountsSlice.reducer,
  keychains: keychainSlice.reducer,
  settings: settingsSlice.reducer,
  apps: appsSlice.reducer,
});

export type RootState = ReturnType<typeof reducer>;

export const store = configureStore({
  reducer: persistReducer<RootState>(persistConfig, reducer),
  devTools: false,
  enhancers: getDefaultEnhancers => {
    if (!isProduction()) return getDefaultEnhancers().concat(devToolsEnhancer({ trace: true }));
    return getDefaultEnhancers();
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// export function clearAllPersistedStorage(fingerprints: string[]) {
//   void Promise.all([deleteAllMnemonics(fingerprints), AsyncStorage.clear()]);
//   store.dispatch(resetWallet());
// }
export type StoreDispatch = typeof store.dispatch;
