import { MempoolTransactionListResponse } from '@stacks/blockchain-api-client';
import { useQuery } from '@tanstack/react-query';

import { AppUseQueryConfig } from '../../query-config';
import { useHiroApiRateLimiter } from '../hiro-rate-limiter';
import { useStacksClient } from '../stacks-client';

export function useAccountMempoolQuery<T extends unknown = MempoolTransactionListResponse>(
  address: string,
  options?: AppUseQueryConfig<MempoolTransactionListResponse, T>
) {
  const client = useStacksClient();
  const limiter = useHiroApiRateLimiter();

  async function accountMempoolFetcher() {
    return limiter.add(
      () => client.transactionsApi.getAddressMempoolTransactions({ address, limit: 50 }),
      {
        throwOnTimeout: true,
      }
    );
  }

  return useQuery({
    enabled: !!address,
    queryKey: ['account-mempool', address],
    queryFn: accountMempoolFetcher,
    refetchOnWindowFocus: false,
    ...options,
  });
}
