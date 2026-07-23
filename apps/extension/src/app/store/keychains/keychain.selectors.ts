import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import {
  extractAccountIndexFromDescriptor,
  extractFingerprintFromDescriptor,
  makeAccountIdentifer,
} from '@leather.io/crypto';
import { keychainAdapter } from '@leather.io/state/keychains';
import { isString } from '@leather.io/utils';

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

const selectBitcoinAccountIdentifiers = createSelector([selectBitcoinKeychains], keychains => {
  const identifiers = keychains
    .map(keychain => {
      const fingerprint = extractFingerprintFromDescriptor(keychain.descriptor);
      const accountIndex = extractAccountIndexFromDescriptor(keychain.descriptor);
      if (accountIndex === null) return null;
      return makeAccountIdentifer(fingerprint, accountIndex);
    })
    .filter(isString);
  return new Set(identifiers);
});

export function useBitcoinKeychainDescriptors() {
  return useSelector(selectBitcoinKeychainDescriptors);
}

export function useBitcoinAccountIdentifiers() {
  return useSelector(selectBitcoinAccountIdentifiers);
}

export function useStacksKeychainDescriptors() {
  return useSelector(selectStacksKeychainDescriptors);
}
