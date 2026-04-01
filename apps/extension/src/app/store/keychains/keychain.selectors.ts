import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import { keychainAdapter } from '@leather.io/state/keychains';

import { RootState } from '..';

function selectKeychainsSlice(state: RootState) {
  return state.keychains;
}

const keychainSelectors = keychainAdapter.getSelectors(selectKeychainsSlice);

const selectAllKeychains = keychainSelectors.selectAll;

export const selectBitcoinKeychains = createSelector([selectAllKeychains], keychains =>
  keychains.filter(keychain => keychain.chain === 'bitcoin')
);

const selectBitcoinKeychainDescriptors = createSelector([selectBitcoinKeychains], keychains =>
  keychains.map(keychain => keychain.descriptor)
);

export const selectStacksKeychains = createSelector([selectAllKeychains], keychains =>
  keychains.filter(keychain => keychain.chain === 'stacks')
);

const selectStacksKeychainDescriptors = createSelector([selectStacksKeychains], keychains =>
  keychains.map(keychain => keychain.descriptor)
);

export function useBitcoinKeychainDescriptors() {
  return useSelector(selectBitcoinKeychainDescriptors);
}

export function useStacksKeychainDescriptors() {
  return useSelector(selectStacksKeychainDescriptors);
}
