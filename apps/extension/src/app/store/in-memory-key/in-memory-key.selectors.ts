import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { deriveRootKeychainFromMnemonicSync } from '@leather.io/crypto';

import { decodeText } from '@shared/utils/text-encoding';

import { RootState } from '..';
import { selectCurrentAccount } from '../software-keys/software-key.selectors';

function selectInMemoryKeys(state: RootState) {
  return state.inMemoryKeys;
}

const selectActiveInMemoryWalletKeyBytes = createSelector(
  selectInMemoryKeys,
  selectCurrentAccount,
  (inMemKeys, currentAccount) => inMemKeys.keys[currentAccount.fingerprint]
);

const selectHasActiveInMemoryWalletKey = createSelector(
  selectActiveInMemoryWalletKeyBytes,
  key => !!key
);

export function useHasActiveInMemoryWalletSecretKey() {
  return useSelector(selectHasActiveInMemoryWalletKey);
}

// No `createSelector` to avoid storing the decoded key as cleartext in memory
export function selectActiveWalletKey(state: RootState) {
  const activeWalletBytes = selectActiveInMemoryWalletKeyBytes(state);
  if (!activeWalletBytes) return null;
  return decodeText(activeWalletBytes);
}

export function useActiveWalletSecretKey() {
  return useSelector(selectActiveWalletKey);
}

export const selectRootKeychains = createSelector(selectInMemoryKeys, inMemKeys =>
  Object.fromEntries(
    Object.entries(inMemKeys.keys)
      .filter(([, keyBytes]) => !!keyBytes)
      .map(([fingerprint, keyBytes]) => [
        fingerprint,
        deriveRootKeychainFromMnemonicSync(decodeText(keyBytes)),
      ])
  )
);
