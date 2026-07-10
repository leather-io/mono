import type { VaultAccountSummary } from '@leather.io/models';

import {
  accountLimitForThreshold,
  isThresholdAtAccountLimit,
  nextAccountIndexForThreshold,
} from './vault-account-index';

function makeAccount(threshold: number, accountIndex: number): VaultAccountSummary {
  return {
    id: `account-${threshold}-${accountIndex}`,
    vaultId: 'vault-1',
    name: `Account ${accountIndex}`,
    icon: null,
    network: 'stx:testnet',
    threshold,
    multisigAddress: 'SP000',
    accountIndex,
    signerCount: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

describe(nextAccountIndexForThreshold.name, () => {
  test('returns 0 when no accounts exist', () => {
    expect(nextAccountIndexForThreshold([], 2)).toBe(0);
  });

  test('returns the next index after a contiguous sequence', () => {
    const accounts = [makeAccount(2, 0), makeAccount(2, 1), makeAccount(2, 2)];
    expect(nextAccountIndexForThreshold(accounts, 2)).toBe(3);
  });

  test('fills gaps below a sparse recovered index', () => {
    const accounts = [makeAccount(2, 0), makeAccount(2, 4)];
    expect(nextAccountIndexForThreshold(accounts, 2)).toBe(1);
  });

  test('ignores accounts of other thresholds', () => {
    const accounts = [makeAccount(1, 0), makeAccount(1, 1), makeAccount(2, 0)];
    expect(nextAccountIndexForThreshold(accounts, 2)).toBe(1);
  });
});

describe(accountLimitForThreshold.name, () => {
  test('caps btc vaults at 10 regardless of member count', () => {
    expect(accountLimitForThreshold('btc:mainnet', 2)).toBe(10);
    expect(accountLimitForThreshold('btc:testnet', 12)).toBe(10);
  });

  test('caps stx vaults at the permutation count when below 10', () => {
    expect(accountLimitForThreshold('stx:mainnet', 2)).toBe(2);
    expect(accountLimitForThreshold('stx:mainnet', 3)).toBe(6);
  });

  test('caps stx vaults at 10 when the permutation count exceeds it', () => {
    expect(accountLimitForThreshold('stx:mainnet', 4)).toBe(10);
    expect(accountLimitForThreshold('stx:testnet', 5)).toBe(10);
  });
});

describe(isThresholdAtAccountLimit.name, () => {
  test('is false while the threshold has fewer accounts than the limit', () => {
    const accounts = [makeAccount(2, 0)];
    expect(isThresholdAtAccountLimit(accounts, 2, 2)).toBe(false);
  });

  test('is true once the threshold reaches the limit', () => {
    const accounts = [makeAccount(2, 0), makeAccount(2, 1)];
    expect(isThresholdAtAccountLimit(accounts, 2, 2)).toBe(true);
  });

  test('counts only accounts of the given threshold', () => {
    const accounts = [makeAccount(1, 0), makeAccount(1, 1), makeAccount(2, 0)];
    expect(isThresholdAtAccountLimit(accounts, 2, 2)).toBe(false);
  });
});
