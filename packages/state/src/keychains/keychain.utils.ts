import { EntityState, EntityStateAdapter } from '@reduxjs/toolkit';

import {
  extractAccountIndexFromDescriptor,
  extractAccountIndexFromPath,
  extractFingerprintFromDescriptor,
  extractKeyOriginPathFromDescriptor,
} from '@leather.io/crypto';
import { extractStacksDerivationPathAccountIndex } from '@leather.io/stacks';
import { isDefined } from '@leather.io/utils';

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

interface WithDescriptor {
  descriptor: string;
}

export function filterKeychainsByFingerprint(fingerprint: string) {
  return (account: WithDescriptor) =>
    extractFingerprintFromDescriptor(account.descriptor) === fingerprint;
}

export function filterKeychainsByAccountIndex(accountIndex: number) {
  return (account: WithDescriptor) =>
    extractAccountIndexFromDescriptor(account.descriptor) === accountIndex;
}

// The account index lives in the addressIndex field for standard Stacks
// paths, or in the hardened account field for Ledger Live paths
export function filterKeychainsByStacksAccount(accountIndex: number) {
  return (account: WithDescriptor) =>
    extractStacksDerivationPathAccountIndex(
      extractKeyOriginPathFromDescriptor(account.descriptor)
    ) === accountIndex;
}

export function findHighestAccountIndexOfFingerprint<T extends WithDescriptor>(
  accounts: T[],
  fingerprint: string
) {
  return Math.max(
    0,
    ...accounts
      .filter(filterKeychainsByFingerprint(fingerprint))
      .map(account => extractAccountIndexFromPath(account.descriptor))
  );
}

export function descriptorKeychainSelectors<T extends WithDescriptor>(
  keychainList: T[],
  filterKeychainsByAccountFn: typeof filterKeychainsByAccountIndex
) {
  function fromFingerprint(fingerprint: string) {
    return keychainList.filter(filterKeychainsByFingerprint(fingerprint));
  }

  function fromAccountIndex(fingerprint: string, accountIndex: number) {
    return fromFingerprint(fingerprint).filter(filterKeychainsByAccountFn(accountIndex));
  }

  function fromAccountId(accountId: string) {
    const [fingerprint, accountIndex, ...rest] = accountId.split('/');
    if (
      fingerprint === undefined ||
      accountIndex === undefined ||
      Number.isNaN(+accountIndex) ||
      rest.length !== 0
    ) {
      throw new Error('Incorrect accountId is passed to destructAccountIdentifier function');
    }

    return fromAccountIndex(fingerprint, +accountIndex);
  }

  return {
    list: keychainList,
    fromFingerprint,
    fromAccountIndex,
    fromAccountId,
  };
}
