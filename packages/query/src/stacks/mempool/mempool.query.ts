import { MempoolTransactionListResponse } from '@stacks/stacks-blockchain-api-types';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

import { useHiroApiRateLimiter } from '../../hiro-rate-limiter';
import { useStacksClient } from '../stacks-client';

export function useAccountMempoolQuery(
  address: string
): UseQueryResult<MempoolTransactionListResponse> {
  const client = useStacksClient();
  const limiter = useHiroApiRateLimiter();

  async function accountMempoolFetcher() {
    return limiter.add(
      () => client.transactionsApi.getAddressMempoolTransactions({ address, limit: 50 }),
      { throwOnTimeout: true }
    );
  }

  return useQuery({
    enabled: !!address,
    queryKey: ['account-mempool', address],
    queryFn: accountMempoolFetcher,
    refetchOnWindowFocus: false,
  });
}
