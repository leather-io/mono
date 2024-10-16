import { useCallback, useMemo } from 'react';

import { MempoolTransaction } from '@stacks/stacks-blockchain-api-types';
import { useQueries } from '@tanstack/react-query';

import {
  createGetAddressMempoolTransactionsQueryOptions,
  useGetTransactionByIdListQuery,
  useStacksClient,
} from '@leather.io/query';
import { isUndefined } from '@leather.io/utils';

export function useGetAddressMempoolTransactionsQueries(addresses: string[]) {
  const client = useStacksClient();
  const queries = useQueries({
    queries: addresses.map(address => ({
      ...createGetAddressMempoolTransactionsQueryOptions({ address, client }),
    })),
  });
  const combinedResult = useCallback(
    () => ({
      totalData: queries
        .map(result => result.data)
        .reduce((acc, result) => {
          if (result?.results) {
            return [...acc, ...result.results];
          }
          return acc;
        }, [] as MempoolTransaction[]),
      isPending: queries.some(result => result.isPending),
    }),
    [queries]
  );

  return combinedResult();
}

const droppedCache = new Map();

export function useStacksPendingTransactions(addresses: string[]) {
  const query = useGetAddressMempoolTransactionsQueries(addresses);
  const pendingStacksTransactions = query.totalData.filter(
    tx => tx.tx_status === 'pending' && !droppedCache.has(tx.tx_id)
  );

  const txs = useGetTransactionByIdListQuery(pendingStacksTransactions.map(tx => tx.tx_id));
  return useMemo(() => {
    return {
      query,
      transactions: txs
        .map(tx => tx.data)
        .filter(tx => {
          if (isUndefined(tx)) return false;
          if (droppedCache.has(tx.tx_id)) return false;
          if (tx.tx_status !== 'pending') {
            // Stale txs persist in the mempool endpoint so we
            // need to cache dropped txids to prevent unneeded fetches
            droppedCache.set(tx.tx_id, true);
            return false;
          }
          return true;
        }) as MempoolTransaction[],
    };
  }, [txs, query]);
}
