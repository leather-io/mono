import { type StacksTx } from '@leather.io/models';

import { type HiroPrincipalMempoolTransaction } from '../infrastructure/api/hiro/hiro-stacks-api.types';

export function filterOutConfirmedTransactions(confirmedTxs: StacksTx[]) {
  return (mempoolTx: HiroPrincipalMempoolTransaction) =>
    !confirmedTxs.some(confirmedTx => confirmedTx.tx_id === mempoolTx.tx_id);
}

export function filterOutStaleTransactions(confirmedTxs: StacksTx[]) {
  return (mempoolTx: HiroPrincipalMempoolTransaction) =>
    !confirmedTxs.some(confirmedTx => confirmedTx.nonce === mempoolTx.sender.nonce);
}
