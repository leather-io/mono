import AsyncStorage from '@react-native-async-storage/async-storage';
import merge from 'lodash.merge';
import { StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { EntityAdapter, EntitySetter, createEntity } from '../entity-adapter';
import { PERSISTED_KEY, filterObjectKeys } from '../utils';

interface Account {
  id: string;
  xpub: string;
}

interface PersistedState {
  theme: string;
  _hasHydrated: boolean;
  accounts: EntityAdapter<Account>;
}

interface PersistedAction {
  setTheme(theme: string): void;
  setHasHydrated(state: boolean): void;
}

export type PersistedStore = PersistedState & PersistedAction;

const NOT_PERSIST_KEYS = ['_hasHydrated'];

export const createPersistedStore: StateCreator<
  PersistedStore,
  [],
  [['zustand/persist', unknown]]
> = persist(
  set => {
    function setAccounts(setter: EntitySetter<Account>) {
      set(state => ({ ...state, accounts: { ...setter(state.accounts) } }));
    }

    return {
      accounts: createEntity<Account>(setAccounts),
      theme: 'light',
      setTheme: theme => set(state => ({ ...state, theme })),
      _hasHydrated: false,
      setHasHydrated: state => {
        set({
          _hasHydrated: state,
        });
      },
    };
  },
  {
    name: PERSISTED_KEY,
    onRehydrateStorage: state => {
      // before hydration
      return () => {
        // after hydration
        state.setHasHydrated(true);
      };
    },
    merge: (persistedState: unknown, currentState: PersistedStore) => {
      return merge({}, currentState, persistedState);
    },
    partialize: state => filterObjectKeys(state, NOT_PERSIST_KEYS),
    storage: createJSONStorage(() => ({
      async getItem(key) {
        const item = await AsyncStorage.getItem(key);
        return item;
      },
      async setItem(key, value) {
        return AsyncStorage.setItem(key, value);
      },
      async removeItem(key) {
        return AsyncStorage.removeItem(key);
      },
    })),
  }
);
