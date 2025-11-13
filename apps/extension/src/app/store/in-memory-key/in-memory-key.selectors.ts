import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { deriveRootKeychainFromMnemonicSync } from '@leather.io/crypto';

import { decodeText } from '@shared/utils/text-encoding';

import { RootState } from '..';
import { selectActiveAccount } from '../active/active.selectors';

function selectInMemoryKeys(state: RootState) {
  return state.inMemoryKeys;
}

const selectActiveInMemoryWalletKeyBytes = createSelector(
  selectInMemoryKeys,
  selectActiveAccount,
  (inMemKeys, activeAccount) => inMemKeys.keys[activeAccount?.fingerprint ?? 'default']
);

const selectHasActiveInMemoryWalletKey = createSelector(
  selectActiveInMemoryWalletKeyBytes,
  key => !!key
);

export function useHasActiveInMemoryWalletSecretKey() {
  return useSelector(selectHasActiveInMemoryWalletKey);
}

// Not using a memoized "createSelector" to avoid storing the decoded key as cleartext in memory
export function selectActiveWalletKey(state: RootState) {
  const activeWalletBytes = selectActiveInMemoryWalletKeyBytes(state);

  if (!activeWalletBytes) return null;
  return decodeText(activeWalletBytes);
}

export const selectActiveWalletRootKeychain = createSelector(
  selectActiveInMemoryWalletKeyBytes,
  key => {
    if (!key) return null;
    return deriveRootKeychainFromMnemonicSync(decodeText(key));
  }
);

export function useActiveWalletSecretKey() {
  return useSelector(selectActiveWalletKey);
}
