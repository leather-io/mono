import { describe, expect, test } from 'vitest';

import type { WalletStore } from '@leather.io/state/wallet';

import { assumedZeroFingerprint } from '@shared/utils';

import { getAddWalletError, getUnmigratedLegacyLedgerError } from './wallet.selectors';

const realFingerprint = 'a1b2c3d4';

function ledgerWallet(fingerprint: string): WalletStore {
  return { fingerprint, name: 'My Ledger', type: 'ledger', createdOn: null };
}

function softwareWallet(fingerprint: string): WalletStore {
  return { fingerprint, name: 'My Wallet', type: 'software', createdOn: null };
}

type WalletEntities = Record<string, WalletStore>;

describe('getUnmigratedLegacyLedgerError', () => {
  test('blocks when a legacy assumed-zero Ledger wallet exists and the device is not yet known', () => {
    const wallets: WalletEntities = {
      [assumedZeroFingerprint]: ledgerWallet(assumedZeroFingerprint),
    };

    expect(getUnmigratedLegacyLedgerError(wallets, realFingerprint)).not.toBeNull();
  });

  test('does not block when no legacy wallet exists', () => {
    expect(getUnmigratedLegacyLedgerError({}, realFingerprint)).toBeNull();
  });

  test('does not block when a wallet already exists under the real fingerprint (safe merge)', () => {
    const wallets: WalletEntities = {
      [assumedZeroFingerprint]: ledgerWallet(assumedZeroFingerprint),
      [realFingerprint]: ledgerWallet(realFingerprint),
    };

    expect(getUnmigratedLegacyLedgerError(wallets, realFingerprint)).toBeNull();
  });

  test('does not block when the legacy assumed-zero wallet is a software wallet', () => {
    const wallets: WalletEntities = {
      [assumedZeroFingerprint]: softwareWallet(assumedZeroFingerprint),
    };

    expect(getUnmigratedLegacyLedgerError(wallets, realFingerprint)).toBeNull();
  });
});

describe('getAddWalletError', () => {
  test('allows adding another Ledger keychain set under an existing Ledger fingerprint', () => {
    const wallets: WalletEntities = { [realFingerprint]: ledgerWallet(realFingerprint) };

    expect(getAddWalletError(wallets, realFingerprint, 'ledger')).toBeNull();
  });

  test('rejects a Ledger when a software wallet already exists under the same fingerprint', () => {
    const wallets: WalletEntities = { [realFingerprint]: softwareWallet(realFingerprint) };

    expect(getAddWalletError(wallets, realFingerprint, 'ledger')).not.toBeNull();
  });

  test('allows a fresh fingerprint', () => {
    expect(getAddWalletError({}, realFingerprint, 'ledger')).toBeNull();
  });
});
