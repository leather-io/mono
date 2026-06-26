import {
  countWalletAccounts,
  isValidAccountIndex,
  softwareAccountCountFromHighestIndex,
} from './wallet-account-count';

const fingerprint = 'e5f6a7b8';

function bitcoinKeychain(accountIndex: number) {
  return {
    chain: 'bitcoin' as const,
    descriptor: `[${fingerprint}/84'/0'/${accountIndex}']xpub${accountIndex}`,
  };
}

function stacksKeychain(accountIndex: number) {
  return {
    chain: 'stacks' as const,
    descriptor: `[${fingerprint}/44'/5757'/0'/0/${accountIndex}]stxpub${accountIndex}`,
  };
}

describe(countWalletAccounts.name, () => {
  describe('software wallets', () => {
    test('returns highestAccountIndex + 1', () => {
      expect(
        countWalletAccounts({ walletType: 'software', fingerprint, highestAccountIndex: 2 })
      ).toBe(3);
    });

    test('falls back to 1 when highestAccountIndex is missing', () => {
      expect(countWalletAccounts({ walletType: 'software', fingerprint })).toBe(1);
    });

    test('falls back to 1 when highestAccountIndex is NaN', () => {
      expect(
        countWalletAccounts({ walletType: 'software', fingerprint, highestAccountIndex: NaN })
      ).toBe(1);
    });

    test('treats highestAccountIndex 0 as a single account', () => {
      expect(
        countWalletAccounts({ walletType: 'software', fingerprint, highestAccountIndex: 0 })
      ).toBe(1);
    });

    test('falls back to 1 when highestAccountIndex is fractional', () => {
      expect(
        countWalletAccounts({ walletType: 'software', fingerprint, highestAccountIndex: 2.5 })
      ).toBe(1);
    });

    test('falls back to 1 when highestAccountIndex is negative', () => {
      expect(
        countWalletAccounts({ walletType: 'software', fingerprint, highestAccountIndex: -1 })
      ).toBe(1);
    });

    test('falls back to 1 when highestAccountIndex is Infinity', () => {
      expect(
        countWalletAccounts({ walletType: 'software', fingerprint, highestAccountIndex: Infinity })
      ).toBe(1);
    });
  });

  describe('isValidAccountIndex', () => {
    test('accepts non-negative integers', () => {
      expect(isValidAccountIndex(0)).toBe(true);
      expect(isValidAccountIndex(1)).toBe(true);
      expect(isValidAccountIndex(5)).toBe(true);
    });

    test('rejects undefined, NaN, fractional, negative and Infinity', () => {
      expect(isValidAccountIndex(undefined)).toBe(false);
      expect(isValidAccountIndex(NaN)).toBe(false);
      expect(isValidAccountIndex(2.5)).toBe(false);
      expect(isValidAccountIndex(-1)).toBe(false);
      expect(isValidAccountIndex(Infinity)).toBe(false);
    });
  });

  describe('softwareAccountCountFromHighestIndex', () => {
    test('returns highestAccountIndex + 1 for valid indices', () => {
      expect(softwareAccountCountFromHighestIndex(0)).toBe(1);
      expect(softwareAccountCountFromHighestIndex(2)).toBe(3);
    });

    test('falls back to 1 for invalid indices', () => {
      expect(softwareAccountCountFromHighestIndex(undefined)).toBe(1);
      expect(softwareAccountCountFromHighestIndex(NaN)).toBe(1);
      expect(softwareAccountCountFromHighestIndex(2.5)).toBe(1);
      expect(softwareAccountCountFromHighestIndex(-1)).toBe(1);
    });
  });

  describe('ledger wallets', () => {
    test('counts contiguous Bitcoin keychains by unique account index', () => {
      expect(
        countWalletAccounts({
          walletType: 'ledger',
          fingerprint,
          keychains: [bitcoinKeychain(0), bitcoinKeychain(1)],
        })
      ).toBe(2);
    });

    test('counts Stacks keychains by their number', () => {
      expect(
        countWalletAccounts({
          walletType: 'ledger',
          fingerprint,
          keychains: [stacksKeychain(0), stacksKeychain(1), stacksKeychain(2)],
        })
      ).toBe(3);
    });

    test('returns 0 for a ledger wallet with no matching keychains', () => {
      expect(countWalletAccounts({ walletType: 'ledger', fingerprint, keychains: [] })).toBe(0);
    });

    test('skips malformed descriptors without throwing', () => {
      const malformed = { chain: 'bitcoin' as const, descriptor: `[${fingerprint}/84']xpub` };
      expect(() =>
        countWalletAccounts({
          walletType: 'ledger',
          fingerprint,
          keychains: [malformed, bitcoinKeychain(0)],
        })
      ).not.toThrow();
      expect(
        countWalletAccounts({
          walletType: 'ledger',
          fingerprint,
          keychains: [malformed, bitcoinKeychain(0)],
        })
      ).toBe(1);
    });

    test('counts unique account indices, ignoring contiguity', () => {
      expect(
        countWalletAccounts({
          walletType: 'ledger',
          fingerprint,
          keychains: [bitcoinKeychain(0), bitcoinKeychain(2)],
        })
      ).toBe(2);
    });

    test('does not count keychains belonging to a fingerprint that this one is a prefix of', () => {
      const otherFingerprint = 'e5f6a7b8c9';
      const foreignKeychain = {
        chain: 'bitcoin' as const,
        descriptor: `[${otherFingerprint}/84'/0'/0']xpub0`,
      };
      expect(
        countWalletAccounts({ walletType: 'ledger', fingerprint, keychains: [foreignKeychain] })
      ).toBe(0);
    });

    test('takes the larger of the Stacks and Bitcoin counts', () => {
      expect(
        countWalletAccounts({
          walletType: 'ledger',
          fingerprint,
          keychains: [stacksKeychain(0), stacksKeychain(1), bitcoinKeychain(0)],
        })
      ).toBe(2);
    });
  });
});
