import { useMemo } from 'react';

import { useGetAccountTransactionsWithTransfersQuery } from './transactions-with-transfers.query';

export function useStacksConfirmedTransactions({ stacksAddress }: { stacksAddress: string }) {
  const txs = useGetAccountTransactionsWithTransfersQuery({ stacksAddress }).data?.results;
  return useMemo(() => txs?.map(txWithTransfers => txWithTransfers.tx), [txs]) ?? [];
}
