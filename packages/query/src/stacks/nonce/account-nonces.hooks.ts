import { useQuery } from '@tanstack/react-query';

import { useCurrentNetworkState } from '../../leather-query-provider';
import { useStacksPendingTransactions } from '../mempool/mempool.hooks';
import { useStacksClient } from '../stacks-client';
import { useStacksConfirmedTransactions } from '../transactions/transactions-with-transfers.hooks';
import { createGetAccountNoncesQueryOptions } from './account-nonces.query';
import { parseAccountNoncesResponse } from './account-nonces.utils';

export function useNextNonce(address: string) {
  const client = useStacksClient();
  const network = useCurrentNetworkState();
  const confirmedTransactions = useStacksConfirmedTransactions(address);
  const { transactions: pendingTransactions } = useStacksPendingTransactions(address);

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
