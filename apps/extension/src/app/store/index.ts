import { useDispatch, useSelector } from 'react-redux';

import { devToolsEnhancer } from '@redux-devtools/remote';
import {
  Action,
  AnyAction,
  ThunkAction,
  Tuple,
  combineReducers,
  configureStore,
} from '@reduxjs/toolkit';
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
import { PersistPartial } from 'redux-persist/es/persistReducer';

import { persistConfig } from '@shared/storage/redux-persist';

import { appPermissionsSlice } from './app-permissions/app-permissions.slice';
import { stxChainSlice } from './chains/stx-chain.slice';
import { inMemoryKeySlice } from './in-memory-key/in-memory-key.slice';
import { bitcoinKeysSlice } from './ledger/bitcoin/bitcoin-key.slice';
import { stacksKeysSlice } from './ledger/stacks/stacks-key.slice';
import { manageTokensSlice } from './manage-tokens/manage-tokens.slice';
import { ledgerNavigationSlice } from './navigation/ledger-navigation.slice';
import { miscNavigationSlice } from './navigation/misc-navigation.slice';
import { modalNavigationSlice } from './navigation/modal-navigation.slice';
import { sendNavigationSlice } from './navigation/send-navigation.slice';
import { networksSlice } from './networks/networks.slice';
import { settingsSlice } from './settings/settings.slice';
import { keySlice } from './software-keys/software-key.slice';
import { submittedTransactionsSlice } from './submitted-transactions/submitted-transactions.slice';
import { uiSlice } from './ui/ui.slice';
import { broadcastActionTypeToOtherFramesMiddleware } from './utils/broadcast-action-types';

export interface RootState {
  appPermissions: ReturnType<typeof appPermissionsSlice.reducer>;
  chains: {
    stx: ReturnType<typeof stxChainSlice.reducer>;
  };
  ledger: {
    bitcoin: ReturnType<typeof bitcoinKeysSlice.reducer>;
    stacks: ReturnType<typeof stacksKeysSlice.reducer>;
  };
  inMemoryKeys: ReturnType<typeof inMemoryKeySlice.reducer>;
  softwareKeys: ReturnType<typeof keySlice.reducer>;
  networks: ReturnType<typeof networksSlice.reducer>;
  submittedTransactions: ReturnType<typeof submittedTransactionsSlice.reducer>;
  settings: ReturnType<typeof settingsSlice.reducer>;
  manageTokens: ReturnType<typeof manageTokensSlice.reducer>;
  navigation: {
    ledger: ReturnType<typeof ledgerNavigationSlice.reducer>;
    misc: ReturnType<typeof miscNavigationSlice.reducer>;
    send: ReturnType<typeof sendNavigationSlice.reducer>;
    modal: ReturnType<typeof modalNavigationSlice.reducer>;
  };
  ui: ReturnType<typeof uiSlice.reducer>;
}

const appReducer = combineReducers({
  appPermissions: appPermissionsSlice.reducer,
  chains: combineReducers({
    stx: stxChainSlice.reducer,
  }),
  ledger: combineReducers({
    bitcoin: bitcoinKeysSlice.reducer,
    stacks: stacksKeysSlice.reducer,
  }),
  inMemoryKeys: inMemoryKeySlice.reducer,
  softwareKeys: keySlice.reducer,
  ordinals: (state = {}) => state,
  networks: networksSlice.reducer,
  submittedTransactions: submittedTransactionsSlice.reducer,
  settings: settingsSlice.reducer,
  manageTokens: manageTokensSlice.reducer,
  navigation: combineReducers({
    ledger: ledgerNavigationSlice.reducer,
    misc: miscNavigationSlice.reducer,
    send: sendNavigationSlice.reducer,
    modal: modalNavigationSlice.reducer,
  }),
  ui: uiSlice.reducer,
});

function rootReducer(state: RootState | undefined, action: Action) {
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
  AnyAction
>;

type AppDispatch = typeof store.dispatch & ((action: AppThunk<Promise<void>>) => void);

export const useAppDispatch: () => AppDispatch = useDispatch;

function selectHasRehydrated(state: RootState & PersistPartial) {
  return state._persist.rehydrated;
}

export function useHasStateRehydrated() {
  return useSelector(selectHasRehydrated);
}
