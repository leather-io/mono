import type { LedgerSigningOutcome } from './ledger-flow.types';

const signingCancelledMessage = 'User cancelled the signing operation';

export function unwrapLedgerSigningOutcome<T>(outcome: LedgerSigningOutcome<T>): T | null {
  if (outcome.status === 'signed') return outcome.value;
  if (outcome.status === 'dismissed') return null;
  if (outcome.status === 'failed') throw new Error(outcome.error);
  throw new Error(signingCancelledMessage);
}
