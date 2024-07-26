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

import { persistConfig } from './/storage-persistors';
import { accountsSlice } from './accounts/accounts.slice';
import { bitcoinKeychainSlice } from './keychains/bitcoin/bitcoin-keychains.slice';
import { settingsSlice } from './settings/settings.slice';
import { walletSlice } from './wallets/wallets.slice';

const reducer = combineReducers({
  wallets: walletSlice.reducer,
  accounts: accountsSlice.reducer,
  keychains: combineReducers({
    bitcoin: bitcoinKeychainSlice.reducer,
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
