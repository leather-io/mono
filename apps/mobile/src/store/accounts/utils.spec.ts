import { describe, expect, test } from 'vitest';

import { accountIcons, deriveIconFromAccountId } from './utils';

describe('deriveIconFromAccountId', () => {
  test('should return a valid icon from the accountIcons array', () => {
    const accountId = 'abc123fingerprint/0';
    const icon = deriveIconFromAccountId(accountId);

    expect(accountIcons).toContain(icon);
  });

  test('should be deterministic - same input always returns same output', () => {
    const accountId = 'test-fingerprint/5';
    const icon1 = deriveIconFromAccountId(accountId);
    const icon2 = deriveIconFromAccountId(accountId);
    const icon3 = deriveIconFromAccountId(accountId);

    expect(icon1).toBe(icon2);
    expect(icon2).toBe(icon3);
  });

  test('should return different icons for different account IDs', () => {
    const accountId1 = 'fingerprint1/0';
    const accountId2 = 'fingerprint2/0';
    const accountId3 = 'fingerprint1/1';

    const icon1 = deriveIconFromAccountId(accountId1);
    const icon2 = deriveIconFromAccountId(accountId2);
    const icon3 = deriveIconFromAccountId(accountId3);

    const uniqueIcons = new Set([icon1, icon2, icon3]);
    expect(uniqueIcons.size).toBeGreaterThan(1);
  });

  test('should handle realistic account IDs', () => {
    const realisticAccountId = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6/0';
    const icon = deriveIconFromAccountId(realisticAccountId);

    expect(accountIcons).toContain(icon);
  });

  test('should derive different icons for sequential account indices', () => {
    const fingerprint = '0x1234567890abcdef';
    const icons = [
      deriveIconFromAccountId(`${fingerprint}/0`),
      deriveIconFromAccountId(`${fingerprint}/1`),
      deriveIconFromAccountId(`${fingerprint}/2`),
      deriveIconFromAccountId(`${fingerprint}/3`),
      deriveIconFromAccountId(`${fingerprint}/4`),
    ];

    const uniqueIcons = new Set(icons);
    expect(uniqueIcons.size).toBeGreaterThan(1);
  });

  test('should handle different fingerprints with same account index', () => {
    const accountIndex = '0';
    const icon1 = deriveIconFromAccountId(`fingerprint-a/${accountIndex}`);
    const icon2 = deriveIconFromAccountId(`fingerprint-b/${accountIndex}`);
    const icon3 = deriveIconFromAccountId(`fingerprint-c/${accountIndex}`);

    const icons = [icon1, icon2, icon3];
    icons.forEach(icon => {
      expect(accountIcons).toContain(icon);
    });
  });

  test('should return consistent icon for account with long fingerprint', () => {
    const longFingerprint = 'a'.repeat(100);
    const accountId = `${longFingerprint}/0`;

    const icon1 = deriveIconFromAccountId(accountId);
    const icon2 = deriveIconFromAccountId(accountId);

    expect(icon1).toBe(icon2);
    expect(accountIcons).toContain(icon1);
  });

  test('should distribute icons across different account IDs', () => {
    const numAccounts = 50;
    const icons = new Set<string>();

    for (let i = 0; i < numAccounts; i++) {
      const accountId = `fingerprint-${i}/0`;
      const icon = deriveIconFromAccountId(accountId);
      icons.add(icon);
    }

    expect(icons.size).toBeGreaterThan(10);
  });
});
