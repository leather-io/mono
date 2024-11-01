import type {
  MempoolTokenTransferTransaction,
  MempoolTransaction,
  Transaction,
} from '@stacks/stacks-blockchain-api-types';

import { createMoney, sumNumbers } from '@leather.io/utils';

import { useStacksConfirmedTransactions } from './use-stacks-confirmed-transactions';
import { useStacksPendingTransactions } from './use-stacks-pending-transactions';

interface CalculatePendingTxsMoneyBalanceArgs {
  txs: MempoolTokenTransferTransaction[];
}
function calculatePendingTxsMoneyBalance({ txs }: CalculatePendingTxsMoneyBalanceArgs) {
  const tokenTransferTxsBalance = sumNumbers(txs.map(tx => Number(tx.token_transfer.amount)));
  const pendingTxsFeesBalance = sumNumbers(txs.map(tx => Number(tx.fee_rate)));

  return createMoney(tokenTransferTxsBalance.plus(pendingTxsFeesBalance), 'STX');
}

function getPendingTxs(confirmedTxs: Transaction[], pendingTxs: MempoolTransaction[]) {
  return pendingTxs.filter(tx => {
    if (confirmedTxs.some(confirmedTx => confirmedTx.nonce === tx.nonce)) {
      return false;
    }
    return tx.tx_type === 'token_transfer';
  }) as unknown as MempoolTokenTransferTransaction[];
}

export function useMempoolTxsBalance(addresses: string[]) {
  const { transactions: pendingTransactions, query } = useStacksPendingTransactions(addresses);
  const confirmedTxs = useStacksConfirmedTransactions(addresses);
  const pendingTxs = getPendingTxs(confirmedTxs, pendingTransactions);
  return {
    query,
    inboundBalance: calculatePendingTxsMoneyBalance({
      txs: pendingTxs.filter(tx => addresses.includes(tx.token_transfer.recipient_address)),
    }),
    outboundBalance: calculatePendingTxsMoneyBalance({
      txs: pendingTxs.filter(tx => addresses.includes(tx.sender_address)),
    }),
  };
}
