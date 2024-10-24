import { calculatePendingTxsMoneyBalance } from '@leather.io/query';

import { useStacksConfirmedTransactions } from '../stacks/use-stacks-confirmed-transactions';
import { useStacksPendingTransactions } from '../stacks/use-stacks-pending-transactions';

export function useMempoolTxsOutboundBalance(address: string) {
  const { transactions: pendingTransactions, query } = useStacksPendingTransactions(address);
  const confirmedTxs = useStacksConfirmedTransactions(address);

  return {
    query,
    balance: calculatePendingTxsMoneyBalance({
      address,
      confirmedTxs,
      pendingTxs: pendingTransactions,
      type: 'outbound',
    }),
  };
}
