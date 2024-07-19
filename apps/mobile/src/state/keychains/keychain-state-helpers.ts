import {
  extractAccountIndexFromDescriptor,
  extractAccountIndexFromPath,
  extractFingerprintFromDescriptor,
} from '@leather.io/crypto';

// These helpers are in a separate file owing to issues running vitest on the other file with state and react imports

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
