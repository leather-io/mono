import { useSelector } from 'react-redux';

import { createSelector } from '@reduxjs/toolkit';

import {
  extractAccountIndexFromPath,
  extractFingerprintFromDescriptor,
  extractKeyOriginPathFromDescriptor,
} from '@leather.io/crypto';
import { sumNumbers, uniqueArray } from '@leather.io/utils';

import { selectBitcoinKeychains, selectStacksKeychains } from '../keychains/keychain.selectors';
import { selectCurrentAccount } from '../software-keys/software-key.selectors';

const selectNumberOfLedgerKeysPersisted = createSelector(
  [selectBitcoinKeychains, selectStacksKeychains],
  (bitcoinKeychains, stacksKeychains) =>
    sumNumbers([bitcoinKeychains.length, stacksKeychains.length])
);

const selectNumberOfLedgerStacksKeysPersisted = createSelector(
  selectStacksKeychains,
  stacksKeychains => sumNumbers([stacksKeychains.length])
);

const selectHasLedgerKeys = createSelector(selectNumberOfLedgerKeysPersisted, numOfKeys =>
  numOfKeys.isGreaterThan(0)
);

const selectHasLedgerBitcoinKeys = createSelector(
  [selectBitcoinKeychains, selectCurrentAccount],
  (bitcoinKeychains, currentAccount) => {
    const bitcoinKeysForCurrentWallet = bitcoinKeychains.filter(keychain => {
      const keychainFingerprint = extractFingerprintFromDescriptor(keychain.descriptor);
      return keychainFingerprint === currentAccount.fingerprint;
    });

    const uniqueBitcoinAccountIndices = uniqueArray(
      bitcoinKeysForCurrentWallet
        .map(keychain => {
          const keyOrigin = extractKeyOriginPathFromDescriptor(keychain.descriptor);
          return extractAccountIndexFromPath(keyOrigin);
        })
        .filter((index): index is number => index !== null)
    );

    return uniqueBitcoinAccountIndices.includes(currentAccount.accountIndex);
  }
);

const selectHasLedgerStacksKeys = createSelector(
  selectNumberOfLedgerStacksKeysPersisted,
  numOfKeys => numOfKeys.isGreaterThan(0)
);

export function useHasLedgerKeys() {
  return useSelector(selectHasLedgerKeys);
}

export function useHasLedgerBitcoinKeys() {
  return useSelector(selectHasLedgerBitcoinKeys);
}

export function useHasLedgerStacksKeys() {
  return useSelector(selectHasLedgerStacksKeys);
}
