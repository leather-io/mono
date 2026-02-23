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

export const selectStacksKeychains = createSelector([selectAllKeychains], keychains =>
  keychains.filter(keychain => keychain.chain === 'stacks')
);
