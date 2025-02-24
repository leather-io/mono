import { MempoolTransaction } from '@stacks/stacks-blockchain-api-types';

import { StacksTx } from '@leather.io/models';

export function filterOutConfirmedTransactions(confirmedTxs: StacksTx[]) {
  return (mempoolTx: MempoolTransaction) =>
    !confirmedTxs.some(confirmedTx => confirmedTx.tx_id === mempoolTx.tx_id);
}

export function filterOutStaleTransactions(confirmedTxs: StacksTx[]) {
  return (mempoolTx: MempoolTransaction) =>
    !confirmedTxs.some(confirmedTx => confirmedTx.nonce === mempoolTx.nonce);
}
