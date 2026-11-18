import type { LedgerSigningOutcome } from './ledger-flow.types';

const signingCancelledMessage = 'User cancelled the signing operation';

class LedgerSigningCancelledError extends Error {
  constructor() {
    super(signingCancelledMessage);
    this.name = 'LedgerSigningCancelledError';
  }
}

export function isLedgerSigningCancelledError(error: unknown) {
  return error instanceof LedgerSigningCancelledError;
}

export function unwrapLedgerSigningOutcome<T>(outcome: LedgerSigningOutcome<T>): T | null {
  if (outcome.status === 'signed') return outcome.value;
  if (outcome.status === 'dismissed') return null;
  if (outcome.status === 'failed') throw new Error(outcome.error);
  throw new LedgerSigningCancelledError();
}
