import { useDispatch, useSelector } from 'react-redux';

import { devToolsEnhancer } from '@redux-devtools/remote';
import {
  Action,
  ThunkAction,
  Tuple,
  type UnknownAction,
  combineReducers,
  configureStore,
} from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  type PersistedState,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import { PersistPartial } from 'redux-persist/es/persistReducer';

import { resetWallet } from '@leather.io/state';
import { keychainSlice } from '@leather.io/state/keychains';
import { walletSlice } from '@leather.io/state/wallet';

import { persistDirtyTracker } from '@shared/storage/dirty-slice-tracker';
import { persistConfig } from '@shared/storage/redux-persist';

import { accountsSlice } from './accounts/accounts.slice';
import { activeSlice } from './active/active.slice';
import { appPermissionsSlice } from './app-permissions/app-permissions.slice';
import { stxChainSlice } from './chains/stx-chain.slice';
import { manageTokensSlice } from './manage-tokens/manage-tokens.slice';
import { networksSlice } from './networks/networks.slice';
import { policySlice } from './policy/policy.slice';
import { settingsSlice } from './settings/settings.slice';
import { keySlice } from './software-keys/software-key.slice';
import { submittedTransactionsSlice } from './submitted-transactions/submitted-transactions.slice';
import { uiSlice } from './ui/ui.slice';
import { hydrateSlicesFromStorage, initCrossFrameStorageSync } from './utils/storage-sync';
import { createTrackDirtySlicesMiddleware } from './utils/track-dirty-slices';

export interface LocalRootState {
  accounts: ReturnType<typeof accountsSlice.reducer>;
  policy: ReturnType<typeof policySlice.reducer>;
  active: ReturnType<typeof activeSlice.reducer>;
  appPermissions: ReturnType<typeof appPermissionsSlice.reducer>;
  chains: {
    stx: ReturnType<typeof stxChainSlice.reducer>;
  };
  keychains: ReturnType<typeof keychainSlice.reducer>;
  wallets: ReturnType<typeof walletSlice.reducer>;
  softwareKeys: ReturnType<typeof keySlice.reducer>;
  networks: ReturnType<typeof networksSlice.reducer>;
  submittedTransactions: ReturnType<typeof submittedTransactionsSlice.reducer>;
  settings: ReturnType<typeof settingsSlice.reducer>;
  manageTokens: ReturnType<typeof manageTokensSlice.reducer>;
  ui: ReturnType<typeof uiSlice.reducer>;
}

export type RootState = LocalRootState & PersistedState;

const appReducer = combineReducers({
  accounts: accountsSlice.reducer,
  policy: policySlice.reducer,
  active: activeSlice.reducer,
  appPermissions: appPermissionsSlice.reducer,
  chains: combineReducers({
    stx: stxChainSlice.reducer,
  }),
  keychains: keychainSlice.reducer,
  wallets: walletSlice.reducer,
  softwareKeys: keySlice.reducer,
  networks: networksSlice.reducer,
  submittedTransactions: submittedTransactionsSlice.reducer,
  settings: settingsSlice.reducer,
  manageTokens: manageTokensSlice.reducer,
  ui: uiSlice.reducer,
});

function rootReducer(state: LocalRootState | undefined, action: Action) {
  if (action.type === resetWallet.type) return appReducer(undefined, action);
  if (hydrateSlicesFromStorage.match(action) && state) return { ...state, ...action.payload };
  return appReducer(state, action);
}

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(new Tuple(createTrackDirtySlicesMiddleware(persistDirtyTracker))),
  enhancers: getDefaultEnhancers =>
    getDefaultEnhancers().concat(
      process.env.WALLET_ENVIRONMENT === 'development'
        ? [
            devToolsEnhancer({
              hostname: 'localhost',
              port: 8000,
              realtime: true,
              suppressConnectErrors: false,
            }),
          ]
        : []
    ),
});

export const persistor = persistStore(store);

initCrossFrameStorageSync(store, persistDirtyTracker);

export type AppThunk<ReturnType = void> = ThunkAction<
  Promise<ReturnType> | ReturnType,
  RootState,
  unknown,
  UnknownAction
>;

type AppDispatch = typeof store.dispatch & ((action: AppThunk<Promise<void>>) => void);

export const useAppDispatch: () => AppDispatch = useDispatch;

function selectHasRehydrated(state: RootState & PersistPartial) {
  return state._persist.rehydrated;
}

export function useHasStateRehydrated() {
  return useSelector(selectHasRehydrated);
}
