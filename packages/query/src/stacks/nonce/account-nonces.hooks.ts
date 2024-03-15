import { useStacksPendingTransactions } from '../mempool/mempool.hooks';
import { useStacksConfirmedTransactions } from '../transactions/transactions-with-transfers.hooks';
import { useGetAccountNoncesQuery } from './account-nonces.query';
import { parseAccountNoncesResponse } from './account-nonces.utils';

export function useNextNonce({ stacksAddress }: { stacksAddress: string }) {
  const confirmedTransactions = useStacksConfirmedTransactions({ stacksAddress });
  const { transactions: pendingTransactions } = useStacksPendingTransactions({ stacksAddress });

  return useGetAccountNoncesQuery(
    { stacksAddress },
    {
      select: resp =>
        parseAccountNoncesResponse({
          addressNonces: resp,
          confirmedTransactions,
          pendingTransactions,
          senderAddress: stacksAddress,
        }),
    }
  );
}
