import { useQuery } from '@tanstack/react-query';

import { createStacksAccountNoncesQueryConfig } from '@leather.io/queries';
import { parseAccountNoncesResponse } from '@leather.io/stacks';

import { useUserSettings } from '@app/hooks/use-user-settings';

import { useStacksPendingTransactions } from '../mempool/mempool.hooks';
import { useStacksConfirmedTransactions } from '../transactions/transactions-with-transfers.hooks';

export function useNextNonce(address: string) {
  const settings = useUserSettings();
  const confirmedTransactions = useStacksConfirmedTransactions(address);
  const { transactions: pendingTransactions } = useStacksPendingTransactions(address);

  return useQuery({
    ...createStacksAccountNoncesQueryConfig(address, settings),
    staleTime: 0,
    select: resp =>
      parseAccountNoncesResponse({
        addressNonces: resp,
        confirmedTransactions,
        pendingTransactions,
        senderAddress: address,
      }),
  });
}
