import { extractAccountIndexFromPath } from '@leather.io/crypto';

// These helpers are in a separate file owing to issues running vitest on the other file with state and react imports

export function filterAccountsByFingerprint(fingerprint: string) {
  return (account: { id: string }) => account.id.split('/')[0] === fingerprint;
}

export function findHighestAccountIndexOfFingerprint<T extends { id: string }>(
  accountsMap: Record<string, T>,
  fingerprint: string
) {
  return Math.max(
    ...Object.values(accountsMap)
      .filter(filterAccountsByFingerprint(fingerprint))
      .map(account => extractAccountIndexFromPath(account.id))
  );
}
