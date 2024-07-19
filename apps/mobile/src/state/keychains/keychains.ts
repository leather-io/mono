import { EntityState, EntityStateAdapter } from '@reduxjs/toolkit';

import { extractKeyOriginPathFromDescriptor } from '@leather.io/crypto';
import { isDefined } from '@leather.io/utils';

import {
  filterKeychainsByAccountIndex,
  filterKeychainsByFingerprint,
} from './keychain-state-helpers';

interface RemoveAccount {
  fingerprint: string;
  accountIndex?: number;
}
// Removing an account is a chain-agnostic action. This function abstracts the
// logic to remove an account from the state, such that it can be reused across
// chains.
export function filterKeychainsToRemove<T extends { descriptor: string }>(
  removeManyFn: EntityStateAdapter<T, string>['removeMany']
) {
  return (state: EntityState<T, string>, removeAction: { payload: RemoveAccount }) => {
    const { fingerprint, accountIndex } = removeAction.payload;

    const keyOriginPathsToRemove = Object.values(state.entities)
      .filter(filterKeychainsByFingerprint(fingerprint))
      .filter(isDefined(accountIndex) ? filterKeychainsByAccountIndex(accountIndex) : () => true)
      .map(account => extractKeyOriginPathFromDescriptor(account.descriptor));

    return removeManyFn(state, keyOriginPathsToRemove);
  };
}
