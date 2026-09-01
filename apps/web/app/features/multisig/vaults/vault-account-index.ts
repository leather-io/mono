import type { AuthNetworkId, VaultAccountSummary } from '@leather.io/models';

export const maxAccountsPerThreshold = 10;

function factorial(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i += 1) result *= i;
  return result;
}

export function nextAccountIndexForThreshold(
  accounts: readonly VaultAccountSummary[],
  threshold: number
): number {
  const usedIndexes = new Set(
    accounts.filter(account => account.threshold === threshold).map(account => account.accountIndex)
  );
  let index = 0;
  while (usedIndexes.has(index)) index += 1;
  return index;
}

export function accountLimitForThreshold(network: AuthNetworkId, memberCount: number): number {
  if (network.startsWith('stx')) {
    return Math.min(maxAccountsPerThreshold, factorial(memberCount));
  }
  return maxAccountsPerThreshold;
}

export function isThresholdAtAccountLimit(
  accounts: readonly VaultAccountSummary[],
  threshold: number,
  limit: number
): boolean {
  return accounts.filter(account => account.threshold === threshold).length >= limit;
}
