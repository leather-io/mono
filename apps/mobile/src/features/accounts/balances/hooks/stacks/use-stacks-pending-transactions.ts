import { useMemo } from 'react';

import { MempoolTransaction } from '@stacks/stacks-blockchain-api-types';

import { useGetTransactionByIdListQuery } from '@leather.io/query';
import { isUndefined } from '@leather.io/utils';

import { useGetAddressMempoolTransactionsQuery } from '../mempool/use-get-address-mempool-transactions-query';

const droppedCache = new Map();
export function useStacksPendingTransactions(address: string) {
  const query = useGetAddressMempoolTransactionsQuery(address);
  const mempoolTxs = query.data ? query.data.results : [];
  const results = mempoolTxs.filter(
    tx => tx.tx_status === 'pending' && !droppedCache.has(tx.tx_id)
  );
  const txs = useGetTransactionByIdListQuery(results.map(tx => tx.tx_id));
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
