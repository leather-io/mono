import { useMemo } from 'react';

import { useGetAccountTransactionsWithTransfersQuery } from './transactions-with-transfers.query';

export function useStacksConfirmedTransactions(address: string) {
  const txs = useGetAccountTransactionsWithTransfersQuery(address).data;
  return useMemo(() => txs?.map(txWithTransfers => txWithTransfers.tx), [txs]) ?? [];
}
