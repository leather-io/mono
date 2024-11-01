import { useMemo } from 'react';

import { useGetAccountTransactionsWithTransfersQueries } from './use-transactions-with-transfers.query';

export function useStacksConfirmedTransactions(addresses: string[]) {
  const txs = useGetAccountTransactionsWithTransfersQueries(addresses).totalData;

  return useMemo(() => txs?.map(txWithTransfers => txWithTransfers.tx), [txs]) ?? [];
}
