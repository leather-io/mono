import { MempoolTransactionStatus, TransactionStatus } from '@stacks/stacks-blockchain-api-types';

import { BitcoinTransaction } from '@leather.io/models';

export type Status = 'pending' | 'success' | 'failed' | 'stalled';

const errorTxStatuses = [
  'abort_by_response',
  'abort_by_post_condition',
  'dropped_replace_by_fee',
  'dropped_replace_across_fork',
  'dropped_too_expensive',
  'dropped_stale_garbage_collect',
  'dropped_problematic',
];
export function getStxTxStatus(
  tx_status: MempoolTransactionStatus | TransactionStatus | undefined
): Status {
  if (tx_status === 'success') return 'success';
  if (tx_status && errorTxStatuses.includes(tx_status)) return 'failed';
  return 'pending';
}
export function getBtcTxStatus(txData: BitcoinTransaction | undefined): Status {
  if (!txData?.height) return 'pending';
  return 'success';
}
