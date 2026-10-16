import type {
  HiroStacksMempoolTransaction,
  HiroStacksTransaction,
} from '../infrastructure/api/hiro/hiro-stacks-api.types';

export function isMempoolTx(
  tx: HiroStacksTransaction | HiroStacksMempoolTransaction
): tx is HiroStacksMempoolTransaction {
  return (
    tx.tx_status !== 'success' &&
    tx.tx_status !== 'abort_by_post_condition' &&
    tx.tx_status !== 'abort_by_response'
  );
}
