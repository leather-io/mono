import { useQuery } from '@tanstack/react-query';

import {
  calculatePendingTxsMoneyBalance,
  createGetAccountTransactionsWithTransfersQueryOptions,
  useCurrentNetworkState,
  useStacksClient,
  useStacksPendingTransactions,
} from '@leather.io/query';

import { useStacksConfirmedTransactions } from '../stacks/use-stacks-confirmed-transactions';

export function useGetAccountTransactionsWithTransfersQuery(address: string) {
  const network = useCurrentNetworkState();
  const client = useStacksClient();

  return useQuery(
    createGetAccountTransactionsWithTransfersQueryOptions({
      address,
      client,
      network: network.chain.stacks.url,
    })
  );
}

export function useMempoolTxsInboundBalance(address: string) {
  const { transactions: pendingTransactions, query } = useStacksPendingTransactions(address);
  const confirmedTxs = useStacksConfirmedTransactions(address);

  return {
    query,
    balance: calculatePendingTxsMoneyBalance({
      address,
      confirmedTxs,
      pendingTxs: pendingTransactions,
      type: 'inbound',
    }),
  };
}
