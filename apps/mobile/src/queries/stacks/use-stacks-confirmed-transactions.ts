import { useMemo } from 'react';

import { useGetAccountTransactionsWithTransfersQueries } from './use-transactions-with-transfers.query';

export function useStacksConfirmedTransactions(addresses: string[]) {
  const txs = useGetAccountTransactionsWithTransfersQueries(addresses).totalData;

  return (
    useMemo(
      () => txs?.map(tx => ({ sender_address: tx.sender.address, nonce: tx.sender.nonce })),
      [txs]
    ) ?? []
  );
}
