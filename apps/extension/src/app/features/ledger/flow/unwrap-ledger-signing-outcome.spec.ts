import { describe, expect, test } from 'vitest';

import {
  isLedgerSigningCancelledError,
  unwrapLedgerSigningOutcome,
} from './unwrap-ledger-signing-outcome';

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

describe(isLedgerSigningCancelledError.name, () => {
  function captureError(outcome: Parameters<typeof unwrapLedgerSigningOutcome>[0]) {
    try {
      unwrapLedgerSigningOutcome(outcome);
    } catch (error) {
      return error;
    }
    return undefined;
  }

  test('identifies the error thrown for a cancelled signing', () => {
    expect(isLedgerSigningCancelledError(captureError({ status: 'cancelled' }))).toBe(true);
  });

  test('does not treat a failed signing as cancelled', () => {
    expect(
      isLedgerSigningCancelledError(
        captureError({ status: 'failed', error: 'Device disconnected' })
      )
    ).toBe(false);
  });

  test('does not treat a plain error with the cancelled message as cancelled', () => {
    expect(isLedgerSigningCancelledError(new Error('User cancelled the signing operation'))).toBe(
      false
    );
  });
});
