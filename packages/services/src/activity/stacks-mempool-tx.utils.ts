import type {
  HiroStacksMempoolTransaction,
  HiroStacksTransaction,
} from '../infrastructure/api/hiro/hiro-stacks-api.types';

type StacksTxByStatus =
  | { readonly mempoolTx: HiroStacksMempoolTransaction; readonly confirmedTx?: undefined }
  | { readonly mempoolTx?: undefined; readonly confirmedTx: HiroStacksTransaction };

export function getStacksTxByStatus(
  tx: HiroStacksTransaction | HiroStacksMempoolTransaction
): StacksTxByStatus {
  switch (tx.tx_status) {
    case 'success':
    case 'abort_by_post_condition':
    case 'abort_by_response':
      return { confirmedTx: tx };
    default:
      return { mempoolTx: tx };
  }
}
