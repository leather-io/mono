import { useMemo } from 'react';

import { useGetAccountTransactionsWithTransfersQuery } from './transactions-with-transfers.query';

export function useStacksConfirmedTransactions(address: string) {
  const txs = useGetAccountTransactionsWithTransfersQuery(address).data;
  return (
    useMemo(
      () => txs?.map(tx => ({ sender_address: tx.sender.address, nonce: tx.sender.nonce })),
      [txs]
    ) ?? []
  );
}
