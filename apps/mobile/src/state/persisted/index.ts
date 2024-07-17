import AsyncStorage from '@react-native-async-storage/async-storage';
import merge from 'lodash.merge';
import { StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { EntityAdapter, EntitySetter, createEntity } from '../entity-adapter';
import { PERSISTED_KEY, filterObjectKeys } from '../utils';

export interface BitcoinAccount {
  /**
   * `id` is in the key info format described in BIP388 https://bips.dev/388
   * `masterFingerprint/derivationPath`
   * @example
   * `2f4b29ec/84'/0'/0'`
   */
  id: string;
  type: 'mnemonic' | 'ledger';
  policy: string;
}

interface PersistedState {
  _hasHydrated: boolean;
  theme: string;
  accounts: {
    bitcoin: EntityAdapter<BitcoinAccount>;
  };
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
    function setBitcoinAccounts(setter: EntitySetter<BitcoinAccount>) {
      set(state => ({ ...state, accounts: { bitcoin: { ...setter(state.accounts.bitcoin) } } }));
    }

    return {
      accounts: {
        bitcoin: createEntity<BitcoinAccount>(setBitcoinAccounts),
      },
      theme: 'light',
      setTheme: theme => set(state => ({ ...state, theme })),
      _hasHydrated: false,
      setHasHydrated: state => set({ _hasHydrated: state }),
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
