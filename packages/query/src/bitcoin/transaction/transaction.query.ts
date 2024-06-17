import { UseQueryResult, useQueries, useQuery } from '@tanstack/react-query';

import { BitcoinTx } from '@leather-wallet/models';

import { AppUseQueryConfig } from '../../query-config';
import { BitcoinClient, useBitcoinClient } from '../bitcoin-client';

function fetchBitcoinTransaction(client: BitcoinClient) {
  return async (txid: string) => {
    return client.transactionsApi.getBitcoinTransaction(txid);
  };
}

type FetchBitcoinTransaction = Awaited<ReturnType<ReturnType<typeof fetchBitcoinTransaction>>>;

// ts-unused-exports:disable-next-line
export function useGetBitcoinTransaction<T extends unknown = FetchBitcoinTransaction>(
  txid: string,
  options?: AppUseQueryConfig<FetchBitcoinTransaction, T>
) {
  const client = useBitcoinClient();
  return useQuery({
    queryKey: ['bitcoin-transaction', txid],
    queryFn: () => fetchBitcoinTransaction(client)(txid),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    ...options,
  });
}

const queryOptions = {
  gcTime: Infinity,
  staleTime: 15 * 60 * 1000,
  refetchOnWindowFocus: false,
} as const;

// ts-unused-exports:disable-next-line
export function useGetBitcoinTransactionQueries(txids: string[]): UseQueryResult<BitcoinTx>[] {
  const client = useBitcoinClient();

  return useQueries({
    queries: txids.map(txid => {
      return {
        queryKey: ['bitcoin-transaction', txid],
        queryFn: () => fetchBitcoinTransaction(client)(txid),
        ...queryOptions,
      };
    }),
  });
}
