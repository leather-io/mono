import { MempoolTransactionListResponse } from '@stacks/stacks-blockchain-api-types';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

import { useStacksClient } from '../stacks-client';

export function useAccountMempoolQuery(
  address: string
): UseQueryResult<MempoolTransactionListResponse> {
  const client = useStacksClient();

  return useQuery({
    enabled: !!address,
    queryKey: ['account-mempool', address],
    queryFn: () => client.getAddressMempoolTransactions(address),
  });
}
