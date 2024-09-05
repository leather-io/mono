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

import { accountsSlice } from './accounts/accounts.write';
import { bitcoinKeychainSlice } from './keychains/bitcoin/bitcoin-keychains.write';
import { stacksKeychainSlice } from './keychains/stacks/stacks-keychains.write';
import { settingsSlice } from './settings/settings.write';
import { persistConfig } from './storage-persistors';
import { walletSlice } from './wallets/wallets.write';

const reducer = combineReducers({
  wallets: walletSlice.reducer,
  accounts: accountsSlice.reducer,
  keychains: combineReducers({
    bitcoin: bitcoinKeychainSlice.reducer,
    stacks: stacksKeychainSlice.reducer,
  }),
  settings: settingsSlice.reducer,
});

export type RootState = ReturnType<typeof reducer>;

export const store = configureStore({
  reducer: persistReducer(persistConfig, reducer),
  devTools: false,
  enhancers: getDefaultEnhancers => {
    if (process.env.NODE_ENV === 'development')
      return getDefaultEnhancers().concat(devToolsEnhancer({ trace: true }));

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
