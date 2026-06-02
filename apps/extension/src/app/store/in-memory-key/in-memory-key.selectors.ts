import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { deriveRootKeychainFromMnemonicSync } from '@leather.io/crypto';

import { RootState } from '..';
import { selectCurrentAccount, selectSoftwareKeys } from '../software-keys/software-key.selectors';
import * as inMemoryStore from './in-memory-storage';
import { useInMemoryKeys } from './use-in-memory-keys';

// The `version` input only busts memoization; results read from `inMemoryStore`, not the arg.
const selectHasActiveInMemoryWalletKey = createSelector(
  [selectCurrentAccount, (_state: RootState, version: number) => version],
  currentAccount => inMemoryStore.hasKey(currentAccount.fingerprint)
);

const selectHasLockedSoftwareWallets = createSelector(
  [selectSoftwareKeys, (_state: RootState, version: number) => version],
  softwareKeys => softwareKeys.some(key => !inMemoryStore.hasKey(key.id))
);
export function useHasLockedSoftwareWallets() {
  const { version } = useInMemoryKeys();
  return useSelector((state: RootState) => selectHasLockedSoftwareWallets(state, version));
}

const selectHasUnlockedSoftwareWallets = createSelector(
  [selectSoftwareKeys, (_state: RootState, version: number) => version],
  softwareKeys => softwareKeys.some(key => inMemoryStore.hasKey(key.id))
);
export function useHasUnlockedSoftwareWallets() {
  const { version } = useInMemoryKeys();
  return useSelector((state: RootState) => selectHasUnlockedSoftwareWallets(state, version));
}

export function useHasActiveInMemoryWalletSecretKey() {
  const { version } = useInMemoryKeys();

  return useSelector((state: RootState) => selectHasActiveInMemoryWalletKey(state, version));
}

const selectActiveWalletKeyAtVersion = createSelector(
  [selectCurrentAccount, (_state: RootState, version: number) => version],
  currentAccount => {
    return inMemoryStore.getKey(currentAccount.fingerprint);
  }
);

export function useActiveWalletSecretKey() {
  const { version } = useInMemoryKeys();
  return useSelector((state: RootState) => selectActiveWalletKeyAtVersion(state, version));
}

const selectWalletKeyAtVersion = createSelector(
  [
    (_state: RootState, fingerprint: string | undefined) => fingerprint,
    (_state: RootState, _fingerprint: string | undefined, version: number) => version,
  ],
  fingerprint => (fingerprint ? inMemoryStore.getKey(fingerprint) : undefined)
);

export function useWalletSecretKey(fingerprint: string | undefined) {
  const { version } = useInMemoryKeys();
  return useSelector((state: RootState) => selectWalletKeyAtVersion(state, fingerprint, version));
}
export const selectRootKeychainsAtVersion = createSelector(
  [selectSoftwareKeys, (_state: RootState, version: number) => version],
  softwareKeys => {
    return Object.fromEntries(
      softwareKeys
        .map(wallet => {
          const key = inMemoryStore.getKey(wallet.id);
          if (!key) return null;
          return [wallet.id, deriveRootKeychainFromMnemonicSync(key)];
        })
        .filter((entry): entry is [string, ReturnType<typeof deriveRootKeychainFromMnemonicSync>] =>
          Boolean(entry)
        )
    );
  }
);
