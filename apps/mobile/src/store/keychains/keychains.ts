import { EntityState, EntityStateAdapter } from '@reduxjs/toolkit';

import { BitcoinAccountKeychain } from '@leather.io/bitcoin';
import {
  extractAccountIndexFromDescriptor,
  extractAccountIndexFromPath,
  extractAddressIndexFromPath,
  extractFingerprintFromDescriptor,
  extractKeyOriginPathFromDescriptor,
} from '@leather.io/crypto';
import { isDefined } from '@leather.io/utils';

import { destructAccountIdentifier } from '../utils';
import { useBitcoinAccounts } from './bitcoin/bitcoin-keychains.read';

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

function filterKeychainsByAddressIndex(addressIndex: number) {
  return (account: WithDescriptor) =>
    extractAddressIndexFromPath(extractKeyOriginPathFromDescriptor(account.descriptor)) ===
    addressIndex;
}

// Stacks uses the addressIndex field for the account index
export const filterKeychainsByStacksAccount = filterKeychainsByAddressIndex;

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
    const { fingerprint, accountIndex } = destructAccountIdentifier(accountId);
    return fromAccountIndex(fingerprint, accountIndex);
  }

  return {
    list: keychainList,
    fromFingerprint,
    fromAccountIndex,
    fromAccountId,
  };
}

interface BitcoinAccountLoaderProps {
  fingerprint: string;
  accountIndex: number;
  fallback?: React.ReactNode;
  children({
    nativeSegwit,
    taproot,
  }: {
    nativeSegwit: BitcoinAccountKeychain;
    taproot: BitcoinAccountKeychain;
  }): React.ReactNode;
}
export function BitcoinAccountLoader({
  fingerprint,
  accountIndex,
  fallback,
  children,
}: BitcoinAccountLoaderProps) {
  const { nativeSegwit, taproot } = useBitcoinAccounts().accountIndexByPaymentType(
    fingerprint,
    accountIndex
  );
  if (!nativeSegwit || !taproot) return fallback ?? null;
  return children({ nativeSegwit, taproot });
}
