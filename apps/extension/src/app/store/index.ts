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

import { keychainSlice } from '@leather.io/state/keychains';
import { walletSlice } from '@leather.io/state/wallet';

import { persistConfig } from '@shared/storage/redux-persist';

import { activeSlice } from './active/active.slice';
import { appPermissionsSlice } from './app-permissions/app-permissions.slice';
import { stxChainSlice } from './chains/stx-chain.slice';
import { inMemoryKeySlice } from './in-memory-key/in-memory-key.slice';
import { bitcoinKeysSlice } from './ledger/bitcoin/bitcoin-key.slice';
import { stacksKeysSlice } from './ledger/stacks/stacks-key.slice';
import { manageTokensSlice } from './manage-tokens/manage-tokens.slice';
import { networksSlice } from './networks/networks.slice';
import { settingsSlice } from './settings/settings.slice';
import { keySlice } from './software-keys/software-key.slice';
import { submittedTransactionsSlice } from './submitted-transactions/submitted-transactions.slice';
import { uiSlice } from './ui/ui.slice';
import { broadcastActionTypeToOtherFramesMiddleware } from './utils/broadcast-action-types';

export interface LocalRootState {
  active: ReturnType<typeof activeSlice.reducer>;
  appPermissions: ReturnType<typeof appPermissionsSlice.reducer>;
  chains: {
    stx: ReturnType<typeof stxChainSlice.reducer>;
  };
  ledger: {
    bitcoin: ReturnType<typeof bitcoinKeysSlice.reducer>;
    stacks: ReturnType<typeof stacksKeysSlice.reducer>;
  };
  wallets: ReturnType<typeof walletSlice.reducer>;
  keychains: ReturnType<typeof keychainSlice.reducer>;
  inMemoryKeys: ReturnType<typeof inMemoryKeySlice.reducer>;
  softwareKeys: ReturnType<typeof keySlice.reducer>;
  networks: ReturnType<typeof networksSlice.reducer>;
  submittedTransactions: ReturnType<typeof submittedTransactionsSlice.reducer>;
  settings: ReturnType<typeof settingsSlice.reducer>;
  manageTokens: ReturnType<typeof manageTokensSlice.reducer>;
  ui: ReturnType<typeof uiSlice.reducer>;
}

export type RootState = LocalRootState & PersistedState;

const appReducer = combineReducers({
  active: activeSlice.reducer,
  appPermissions: appPermissionsSlice.reducer,
  chains: combineReducers({
    stx: stxChainSlice.reducer,
  }),
  ledger: combineReducers({
    bitcoin: bitcoinKeysSlice.reducer,
    stacks: stacksKeysSlice.reducer,
  }),
  wallets: walletSlice.reducer,
  keychains: keychainSlice.reducer,
  inMemoryKeys: inMemoryKeySlice.reducer,
  softwareKeys: keySlice.reducer,
  ordinals: (state = {}) => state,
  networks: networksSlice.reducer,
  submittedTransactions: submittedTransactionsSlice.reducer,
  settings: settingsSlice.reducer,
  manageTokens: manageTokensSlice.reducer,
  ui: uiSlice.reducer,
});

function rootReducer(state: LocalRootState | undefined, action: Action) {
  if (action.type === 'keys/signOut') return appReducer(undefined, action);
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
    }).concat(new Tuple(broadcastActionTypeToOtherFramesMiddleware)),
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
