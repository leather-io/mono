import type { TxStatus } from '../data/multisig-types';
import { type TxIndicatorKind, txStatusToIndicatorKind } from './tx-status-indicator';

const cases: [TxStatus, TxIndicatorKind][] = [
  ['pending', 'sent'],
  ['queued', 'sent'],
  ['signed', 'sent'],
  ['broadcast', 'sent'],
  ['confirmed', 'sent'],
  ['failed', 'failed'],
  ['dropped', 'failed'],
  ['cancelled', 'failed'],
];

describe('txStatusToIndicatorKind', () => {
  test.each(cases)('maps %s to the %s indicator', (status, kind) => {
    expect(txStatusToIndicatorKind(status)).toBe(kind);
  });
});
