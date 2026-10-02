import { describe, expect, test } from 'vitest';

import { unwrapLedgerSigningOutcome } from './unwrap-ledger-signing-outcome';

describe(unwrapLedgerSigningOutcome.name, () => {
  test('returns the signed value', () => {
    expect(unwrapLedgerSigningOutcome({ status: 'signed', value: 'signed-tx' })).toBe('signed-tx');
  });

  test('returns null for a dismissed signing so callers can let the user retry', () => {
    expect(unwrapLedgerSigningOutcome({ status: 'dismissed' })).toBeNull();
  });

  test('throws the user cancelled error for a cancelled signing', () => {
    expect(() => unwrapLedgerSigningOutcome({ status: 'cancelled' })).toThrow(
      new Error('User cancelled the signing operation')
    );
  });

  test('throws the settlement error for a failed signing', () => {
    expect(() => unwrapLedgerSigningOutcome({ status: 'failed', error: 'No tx returned' })).toThrow(
      new Error('No tx returned')
    );
  });
});
