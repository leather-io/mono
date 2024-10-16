import { useMemo } from 'react';

import { useGetAccountTransactionsWithTransfersQueries } from './transactions-with-transfers.query';

/* @deprecated should do this in the query instead */
export function useStacksConfirmedTransactions(addresses: string[]) {
  const txs = useGetAccountTransactionsWithTransfersQueries(addresses).totalData;

  return useMemo(() => txs?.map(txWithTransfers => txWithTransfers.tx), [txs]) ?? [];
}
