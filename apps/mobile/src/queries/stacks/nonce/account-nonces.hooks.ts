import { useUserSettings } from '@/hooks/use-user-settings';
import { useQuery } from '@tanstack/react-query';

import { createStacksAccountNoncesQueryConfig } from '@leather.io/queries';
import { parseAccountNoncesResponse } from '@leather.io/stacks';

import { useStacksConfirmedTransactions } from '../use-stacks-confirmed-transactions';
import { useStacksPendingTransactions } from '../use-stacks-pending-transactions';

export function useNextNonce(address: string) {
  const settings = useUserSettings();
  const confirmedTransactions = useStacksConfirmedTransactions([address]);
  const { transactions: pendingTransactions } = useStacksPendingTransactions([address]);

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
