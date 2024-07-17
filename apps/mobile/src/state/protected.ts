import * as SecureStore from 'expo-secure-store';
import merge from 'lodash.merge';
import { StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { EntityAdapter, EntitySetter, createEntity } from './entity-adapter';
import { PROTECTED_KEY, filterObjectKeys } from './utils';

interface Mnemonic {
  /** Master key fingerprint */
  id: string;
  /** BIP39 mnemonic phrase */
  mnemonic: string;
  /** User-defined name for wallet */
  name?: string;
}

interface ProtectedState {
  _hasHydrated: boolean;
  mnemonic: EntityAdapter<Mnemonic>;
}

interface ProtectedAction {
  setHasHydrated(state: boolean): void;
}

export type ProtectedStore = ProtectedState & ProtectedAction;

const nonPersistedKeys = ['_hasHydrated'];

export const createProtectedStore: StateCreator<
  ProtectedStore,
  [],
  [['zustand/persist', unknown]]
> = persist(
  set => {
    function setMnemonic(setter: EntitySetter<Mnemonic>) {
      set(state => ({ ...state, mnemonic: { ...setter(state.mnemonic) } }));
    }
    return {
      mnemonic: createEntity<Mnemonic>(setMnemonic),
      _hasHydrated: false,
      setHasHydrated: state => {
        set({
          _hasHydrated: state,
        });
      },
    };
  },
  {
    name: PROTECTED_KEY,
    onRehydrateStorage: state => {
      return () => state.setHasHydrated(true);
    },
    merge: (persistedState: unknown, currentState: ProtectedStore) => {
      return merge({}, currentState, persistedState);
    },
    partialize: state => filterObjectKeys(state, nonPersistedKeys),
    storage: createJSONStorage(() => ({
      getItem(key) {
        return SecureStore.getItemAsync(key, {
          // Don't require authentication for now. We should change it to `true`
          // once we start doing EAS prebuild.
          // More on that: https://docs.expo.dev/versions/latest/sdk/securestore/
          requireAuthentication: false,
        });
      },
      setItem(key, value) {
        return SecureStore.setItemAsync(key, value, {
          requireAuthentication: false,
        });
      },
      removeItem(key) {
        return SecureStore.deleteItemAsync(key);
      },
    })),
  }
);
