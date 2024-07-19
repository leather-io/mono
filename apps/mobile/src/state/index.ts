import { combineReducers, configureStore } from '@reduxjs/toolkit';
import devToolsEnhancer from 'redux-devtools-expo-dev-plugin';
import { rememberReducer } from 'redux-remember';

import { createAsyncStorageEnhancer } from './/storage-persistors';
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

const storageEnhancer = createAsyncStorageEnhancer([
  'wallets',
  'accounts',
  'keychains',
  'settings',
]);

export const store = configureStore({
  reducer: rememberReducer(reducer),
  devTools: false,
  enhancers: getDefaultEnhancers => {
    const enhancers = getDefaultEnhancers().concat(storageEnhancer);

    if (process.env.NODE_ENV === 'development')
      return enhancers.concat(devToolsEnhancer({ trace: true }));

    return enhancers;
  },
});
