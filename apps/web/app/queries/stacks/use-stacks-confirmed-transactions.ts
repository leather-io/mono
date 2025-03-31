import { useMemo } from 'react';

import { useGetAccountTransactionsWithTransfersQueries } from '../transaction/use-transactions-with-transfers.query';

export function useStacksConfirmedTransactions(addresses: string[]) {
  const txs = useGetAccountTransactionsWithTransfersQueries(addresses);
  const txsData = txs.totalData;
  return useMemo(() => txsData?.map(txWithTransfers => txWithTransfers.tx), [txsData]) ?? [];
}
