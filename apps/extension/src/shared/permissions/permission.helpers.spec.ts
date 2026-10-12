import { describe, expect, test } from 'vitest';

import type { BitcoinNetworkModes } from '@leather.io/models';
import type { WalletStore } from '@leather.io/state/wallet';

import { type AppPermission, isConnectedToExistingWallet } from './permission.helpers';

const fingerprint = 'a1b2c3d4';
const mainnet: BitcoinNetworkModes = 'mainnet';

function createPermission(overrides: Partial<AppPermission> = {}): AppPermission {
  return {
    origin: 'https://app.com',
    fingerprint,
    accountIndex: 0,
    requestedAccounts: '2026-01-01T00:00:00.000Z',
    networkMode: mainnet,
    ...overrides,
  };
}

function createWalletEntities(fingerprints: string[]): Partial<Record<string, WalletStore>> {
  const entities: Record<string, WalletStore> = {};
  for (const value of fingerprints)
    entities[value] = { fingerprint: value, type: 'software', name: 'Wallet', createdOn: null };
  return entities;
}

describe('isConnectedToExistingWallet', () => {
  test('returns false when there is no permission', () => {
    expect(isConnectedToExistingWallet(undefined, createWalletEntities([fingerprint]))).toBe(false);
  });

  test('returns false when the permission has not requested accounts', () => {
    const permission = createPermission({ requestedAccounts: undefined });
    expect(isConnectedToExistingWallet(permission, createWalletEntities([fingerprint]))).toBe(
      false
    );
  });

  test.each(['origin', 'fingerprint', 'accountIndex', 'networkMode'] as const)(
    'returns false when the permission has no %s',
    field => {
      const permission = { ...createPermission(), [field]: undefined };
      expect(isConnectedToExistingWallet(permission, createWalletEntities([fingerprint]))).toBe(
        false
      );
    }
  );

  test.each(['app.com', 'app.com:8443', 'https://app.com/path', 'javascript:void(0)', ''])(
    'returns false when the persisted origin %s is not a canonical web origin',
    origin => {
      const permission = createPermission({ origin });
      expect(isConnectedToExistingWallet(permission, createWalletEntities([fingerprint]))).toBe(
        false
      );
    }
  );

  test('returns false when the granted fingerprint no longer has a wallet', () => {
    const permission = createPermission({ fingerprint: 'removed-wallet' });
    expect(isConnectedToExistingWallet(permission, createWalletEntities([fingerprint]))).toBe(
      false
    );
  });

  test('returns true when the permission is granted and its wallet still exists', () => {
    const permission = createPermission({ fingerprint });
    expect(isConnectedToExistingWallet(permission, createWalletEntities([fingerprint]))).toBe(true);
  });

  test('returns true regardless of a policy binding on the permission', () => {
    const permission = createPermission({ policyId: `${fingerprint}/0/bc1qaddr/mainnet` });
    expect(isConnectedToExistingWallet(permission, createWalletEntities([fingerprint]))).toBe(true);
  });
});
