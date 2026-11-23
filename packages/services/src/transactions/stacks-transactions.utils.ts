import {
  type HiroPrincipalMempoolTransaction,
  type HiroPrincipalTransaction,
} from '../infrastructure/api/hiro/hiro-stacks-api.types';

export function filterOutConfirmedTransactions(confirmedTxs: HiroPrincipalTransaction[]) {
  return (mempoolTx: HiroPrincipalMempoolTransaction) =>
    !confirmedTxs.some(confirmedTx => confirmedTx.tx_id === mempoolTx.tx_id);
}

export function filterOutStaleTransactions(confirmedTxs: HiroPrincipalTransaction[]) {
  return (mempoolTx: HiroPrincipalMempoolTransaction) =>
    !confirmedTxs.some(
      confirmedTx =>
        confirmedTx.sender.address === mempoolTx.sender.address &&
        confirmedTx.sender.nonce === mempoolTx.sender.nonce
    );
}
