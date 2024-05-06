import * as SecureStore from 'expo-secure-store';
import merge from 'lodash.merge';
import { StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { EntityAdapter, EntitySetter, createEntity } from './entity-adapter';
import { PROTECTED_KEY, filterObjectKeys } from './utils';

interface SoftwareWallet {
  id: string;
  type: 'software';
  mnemonic: string;
}

interface HardwareWallet {
  id: string;
  type: 'ledger';
  deviceType: string;
}

type Wallet = SoftwareWallet | HardwareWallet;

interface ProtectedState {
  _hasHydrated: boolean;
  wallet: EntityAdapter<Wallet>;
}

interface ProtectedAction {
  setHasHydrated(state: boolean): void;
}

export type ProtectedStore = ProtectedState & ProtectedAction;

const NOT_PERSIST_KEYS = ['_hasHydrated'];

export const createProtectedStore: StateCreator<
  ProtectedStore,
  [],
  [['zustand/persist', unknown]]
> = persist(
  set => {
    function setWallet(setter: EntitySetter<Wallet>) {
      set(state => ({ ...state, wallet: { ...setter(state.wallet) } }));
    }
    return {
      wallet: createEntity<Wallet>(setWallet),
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
      // before hydration
      return () => {
        // after hydration
        state.setHasHydrated(true);
      };
    },
    merge: (persistedState: unknown, currentState: ProtectedStore) => {
      return merge({}, currentState, persistedState);
    },
    partialize: state => filterObjectKeys(state, NOT_PERSIST_KEYS),
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
