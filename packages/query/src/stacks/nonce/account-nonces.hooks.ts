import { useStacksPendingTransactions } from '../mempool/mempool.hooks';
import { useStacksConfirmedTransactions } from '../transactions/transactions-with-transfers.hooks';
import { useGetAccountNoncesQuery } from './account-nonces.query';
import { parseAccountNoncesResponse } from './account-nonces.utils';

export function useNextNonce(address: string) {
  const confirmedTransactions = useStacksConfirmedTransactions(address);
  const { transactions: pendingTransactions } = useStacksPendingTransactions(address);

  return useGetAccountNoncesQuery(address, {
    select: resp =>
      parseAccountNoncesResponse({
        addressNonces: resp,
        confirmedTransactions,
        pendingTransactions,
        senderAddress: address,
      }),
  });
}
