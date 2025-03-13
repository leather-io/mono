// import { devToolsEnhancer } from '@redux-devtools/remote';
import { useDispatch } from 'react-redux';

import { type Action, combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  type PersistConfig,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { isServer } from '~/helpers/utils';

import { accountSlice } from './accounts/accounts.slice';

export interface RootState {
  accounts: ReturnType<typeof accountSlice.reducer>;
}

const appReducer = combineReducers({
  accounts: accountSlice.reducer,
});

function rootReducer(state: RootState | undefined, action: Action) {
  return appReducer(state, action);
}

export function createAppStore() {
  if (isServer())
    return {
      store: configureStore({ reducer: appReducer }),
    };

  const persistConfig: PersistConfig<RootState> = {
    key: 'store',
    serialize: true,
    storage,
    whitelist: ['accounts'],
  };

  const persistedReducer = persistReducer(persistConfig, rootReducer);
  const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
  return { store, persistor: persistStore(store) };
}

export const { store, persistor } = createAppStore();

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
