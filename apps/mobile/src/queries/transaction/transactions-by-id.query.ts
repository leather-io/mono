import { toFetchState } from '@/components/loading';
import { QueryFunctionContext, useQueries, useQuery } from '@tanstack/react-query';

import { createGetTransactionByIdQueryOptions } from '@leather.io/query';
import { getBitcoinTransactionsService, getStacksTransactionsService } from '@leather.io/services';

import { useStacksClient } from '../stacks/stacks-client';

export function useGetTransactionByIdListQuery(txids: string[]) {
  const client = useStacksClient();

  return useQueries({
    queries: txids.map(txid => {
      return {
        ...createGetTransactionByIdQueryOptions({ client, txid }),
      };
    }),
  });
}

function useGetStxTransactionByIdQuery(txid: string) {
  return useQuery({
    queryKey: ['get-transaction-by-id-query'],
    refetchInterval(query) {
      if (!query.state.data || query.state.data.tx_status === 'pending') return 1000;
      return false;
    },

    queryFn: ({ signal }: QueryFunctionContext) =>
      getStacksTransactionsService().getTransactionById(txid, signal),
  });
}

export function useGetStxTransactionById(txid: string) {
  return toFetchState(useGetStxTransactionByIdQuery(txid));
}

function useGetBtcTransactionByIdQuery(txid: string) {
  return useQuery({
    queryKey: ['get-transaction-by-id-query'],
    refetchInterval(query) {
      if (!query.state.data || query.state.data.time) return 3000;
      return false;
    },
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBitcoinTransactionsService().getTransactionByTxId(txid, signal),
  });
}

export function useGetBtcTransactionById(txid: string) {
  return toFetchState(useGetBtcTransactionByIdQuery(txid));
}
