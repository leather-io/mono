import { toFetchState } from '@/components/loading/fetch-state';
import { useInscriptionsFlag } from '@/features/feature-flags';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountAddresses } from '@leather.io/models';
import { getCollectiblesService } from '@leather.io/services';

/**
 * @deprecated useTotalCollectibles is not used now we have moved to single account view
 * @see useAccountCollectibles
 */
export function useTotalCollectibles() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useTotalCollectiblesQuery(accounts));
}

export function useAccountCollectibles(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useAccountCollectiblesQuery(account));
}

/**
 * @deprecated useTotalCollectiblesQuery is not used now we have moved to single account view
 * @see useAccountCollectiblesQuery
 */
function useTotalCollectiblesQuery(accounts: AccountAddresses[]) {
  // const inscriptionsFlag = useInscriptionsFlag();
  // if (!inscriptionsFlag) {
  //   accounts.forEach(account => {
  //     account.bitcoin = undefined;
  //   });
  // }
  return useQuery({
    queryKey: ['collectibles-service-get-total-collectibles', accounts],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getCollectiblesService().getTotalCollectibles(accounts, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 5000,
    gcTime: 1 * 5000,
  });
}

function useAccountCollectiblesQuery(account: AccountAddresses) {
  // const inscriptionsFlag = useInscriptionsFlag();
  // if (!inscriptionsFlag) {
  //   account.bitcoin = undefined;
  // }
  return useQuery({
    queryKey: ['collectibles-service-get-account-collectibles', account],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getCollectiblesService().getAccountCollectibles(account, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 5000,
    gcTime: 1 * 5000,
  });
}
