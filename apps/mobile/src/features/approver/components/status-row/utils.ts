import type { BitcoinTransaction, StacksTransaction } from '@leather.io/models';

export type Status = 'pending' | 'success' | 'failed' | 'stalled';

const errorTxStatuses: StacksTransaction['status'][] = [
  'abort_by_response',
  'abort_by_post_condition',
  'problematic_skipped',
  'dropped_replace_by_fee',
  'dropped_replace_across_fork',
  'dropped_too_expensive',
  'dropped_stale_garbage_collect',
  'dropped_problematic',
];
export function getStxTxStatus(txStatus: StacksTransaction['status'] | undefined): Status {
  if (txStatus === 'success') return 'success';
  if (txStatus && errorTxStatuses.includes(txStatus)) return 'failed';
  return 'pending';
}
export function getBtcTxStatus(txData: BitcoinTransaction | undefined): Status {
  if (!txData?.height) return 'pending';
  return 'success';
}
