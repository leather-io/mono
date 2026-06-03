import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { deriveRootKeychainFromMnemonicSync } from '@leather.io/crypto';

import { RootState } from '..';
import { selectCurrentAccount, selectSoftwareKeys } from '../software-keys/software-key.selectors';
import * as inMemoryStore from './in-memory-storage';
import { useInMemoryKeys } from './use-in-memory-keys';

export function useHasLockedSoftwareWallets() {
  const { hasKey } = useInMemoryKeys();
  const softwareKeys = useSelector(selectSoftwareKeys);
  return softwareKeys.some(key => !hasKey(key.id));
}

export function useHasUnlockedSoftwareWallets() {
  const { hasKey } = useInMemoryKeys();
  const softwareKeys = useSelector(selectSoftwareKeys);
  return softwareKeys.some(key => hasKey(key.id));
}

export function useHasActiveInMemoryWalletSecretKey() {
  const { hasKey } = useInMemoryKeys();
  const fingerprint = useSelector((state: RootState) => selectCurrentAccount(state).fingerprint);
  return hasKey(fingerprint);
}

// Intentionally do NOT use `createSelector` (or any memoized selector) for the
// decoded secret key. reselect retains its last result in a module-lifetime memo
// cache, which would keep the cleartext mnemonic resident in process memory until
// the inputs change and across component unmounts. Read it on demand instead;
// reactivity comes from `useInMemoryKeys()` (useSyncExternalStore).
export function useActiveWalletSecretKey() {
  const { getKey } = useInMemoryKeys();
  const fingerprint = useSelector((state: RootState) => selectCurrentAccount(state).fingerprint);
  return getKey(fingerprint);
}

export function useWalletSecretKey(fingerprint: string | undefined) {
  const { getKey } = useInMemoryKeys();
  return fingerprint ? getKey(fingerprint) : undefined;
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
