import { MempoolTransactionListResponse } from '@stacks/blockchain-api-client';
import { useQuery } from '@tanstack/react-query';

import { AppUseQueryConfig } from '../../query-config';
import { useHiroApiRateLimiter } from '../rate-limiter';
import { useStacksClient } from '../stacks-client';

export function useAccountMempoolQuery<T extends unknown = MempoolTransactionListResponse>(
  address: string,
  options?: AppUseQueryConfig<MempoolTransactionListResponse, T>
) {
  const client = useStacksClient();
  const limiter = useHiroApiRateLimiter();

  async function accountMempoolFetcher() {
    await limiter.removeTokens(1);
    return client.transactionsApi.getAddressMempoolTransactions({ address, limit: 50 });
  }

  return useQuery({
    enabled: !!address,
    queryKey: ['account-mempool', address],
    queryFn: accountMempoolFetcher,
    refetchOnWindowFocus: false,
    ...options,
  });
}
