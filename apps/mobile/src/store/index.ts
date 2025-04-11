import { isProduction } from '@/shared/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

import { accountEntitySchema, accountsSlice } from './accounts/accounts.write';
import { appsSlice } from './apps/apps.write';
import { resetWallet } from './global-action';
import { bitcoinKeychainSlice } from './keychains/bitcoin/bitcoin-keychains.write';
import { bitcoinKeychainStoreSchema } from './keychains/bitcoin/utils';
import { stacksKeychainSlice } from './keychains/stacks/stacks-keychains.write';
import { stacksKeychainStoreSchema } from './keychains/stacks/utils';
import { settingsSlice } from './settings/settings.write';
import { settingsSchema } from './settings/utils';
import { deleteAllMnemonics, persistConfig } from './storage-persistors';
import { walletEntitySchema } from './wallets/utils';
import { walletSlice } from './wallets/wallets.write';

export const stateSchema = z.object({
  wallets: walletEntitySchema,
  accounts: accountEntitySchema,
  keychains: z.object({
    bitcoin: bitcoinKeychainStoreSchema,
    stacks: stacksKeychainStoreSchema,
  }),
  settings: settingsSchema,
});

const reducer = combineReducers({
  wallets: walletSlice.reducer,
  accounts: accountsSlice.reducer,
  keychains: combineReducers({
    bitcoin: bitcoinKeychainSlice.reducer,
    stacks: stacksKeychainSlice.reducer,
  }),
  settings: settingsSlice.reducer,
  apps: appsSlice.reducer,
});

export type RootState = ReturnType<typeof reducer>;

export const store = configureStore({
  reducer: persistReducer(persistConfig, reducer),
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

export function clearAllPersistedStorage(fingerprints: string[]) {
  void Promise.all([deleteAllMnemonics(fingerprints), AsyncStorage.clear()]);
  store.dispatch(resetWallet());
}
export type StoreDispatch = typeof store.dispatch;
