import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { deriveRootKeychainFromMnemonicSync } from '@leather.io/crypto';

import { RootState } from '..';
import { selectCurrentAccount, selectSoftwareKeys } from '../software-keys/software-key.selectors';
import * as inMemoryStore from './in-memory-storage';

const selectHasActiveInMemoryWalletKey = createSelector(selectCurrentAccount, currentAccount =>
  inMemoryStore.hasKey(currentAccount.fingerprint)
);

export function useHasActiveInMemoryWalletSecretKey() {
  return useSelector(selectHasActiveInMemoryWalletKey);
}

export function selectActiveWalletKey(state: RootState) {
  const currentAccount = selectCurrentAccount(state);
  return inMemoryStore.getKey(currentAccount.fingerprint);
}

export function useActiveWalletSecretKey() {
  return useSelector(selectActiveWalletKey);
}

export const selectRootKeychains = createSelector(selectSoftwareKeys, softwareKeys => {
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
});
