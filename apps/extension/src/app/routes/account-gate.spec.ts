import { describe, expect, test } from 'vitest';

import { RouteUrls } from '@shared/route-urls';

import { selectAccountGateDestination } from './account-gate';

describe(selectAccountGateDestination.name, () => {
  test('navigates to onboarding when there are no wallets', () => {
    expect(selectAccountGateDestination({ walletCount: 0, hasLockedSoftwareWallets: false })).toBe(
      RouteUrls.Onboarding
    );
  });

  test('navigates to unlock when a software wallet is locked', () => {
    expect(selectAccountGateDestination({ walletCount: 1, hasLockedSoftwareWallets: true })).toBe(
      RouteUrls.Unlock
    );
  });

  test('passes through for unlocked or Ledger-only wallets', () => {
    expect(
      selectAccountGateDestination({ walletCount: 1, hasLockedSoftwareWallets: false })
    ).toBeNull();
  });
});
