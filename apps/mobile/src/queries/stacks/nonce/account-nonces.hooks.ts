import { useCurrentNetworkState } from '@/queries/leather-query-provider';
import { useQuery } from '@tanstack/react-query';

import { createGetAccountNoncesQueryOptions, parseAccountNoncesResponse } from '@leather.io/query';

import { useStacksClient } from '../stacks-client';
import { useStacksConfirmedTransactions } from '../use-stacks-confirmed-transactions';
import { useStacksPendingTransactions } from '../use-stacks-pending-transactions';

export function useNextNonce(address: string) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();
  const confirmedTransactions = useStacksConfirmedTransactions([address]);
  const { transactions: pendingTransactions } = useStacksPendingTransactions([address]);

  return useQuery({
    ...createGetAccountNoncesQueryOptions({ address, client, network: network.chain.stacks.url }),
    select: resp =>
      parseAccountNoncesResponse({
        addressNonces: resp,
        confirmedTransactions,
        pendingTransactions,
        senderAddress: address,
      }),
  });
}
