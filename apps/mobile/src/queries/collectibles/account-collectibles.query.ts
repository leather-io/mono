import { toFetchState } from '@/components/loading/fetch-state';
import { useCollectiblesFlag } from '@/features/feature-flags';
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

export function useAccountCollectibleByAssetId(
  fingerprint: string,
  accountIndex: number,
  assetId: string
) {
  const account = useAccountAddresses(fingerprint, accountIndex);

  return toFetchState(useAccountCollectibleByAssetIdQuery(account, assetId));
}

/**
 * @deprecated useTotalCollectiblesQuery is not used now we have moved to single account view
 * @see useAccountCollectiblesQuery
 */
function useTotalCollectiblesQuery(accounts: AccountAddresses[]) {
  const collectiblesFlag = useCollectiblesFlag();
  if (!collectiblesFlag) {
    accounts.forEach(account => {
      account.bitcoin = undefined;
    });
  }
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
  const collectiblesFlag = useCollectiblesFlag();
  if (!collectiblesFlag) {
    account.bitcoin = undefined;
  }
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

function useAccountCollectibleByAssetIdQuery(account: AccountAddresses, assetId: string) {
  const collectiblesFlag = useCollectiblesFlag();
  if (!collectiblesFlag) {
    account.bitcoin = undefined;
  }
  return useQuery({
    queryKey: ['collectibles-service-get-account-collectibles', account, assetId],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getCollectiblesService()
        .getAccountCollectibles(account, signal)
        .then(collectibles => {
          return collectibles.filter(collectible => {
            if (collectible.protocol === 'sip9') {
              return collectible.assetId === assetId;
            }
            if (collectible.protocol === 'inscription') {
              return collectible.id === assetId;
            }
            if (collectible.protocol === 'stamp') {
              return collectible.stamp.toString() === assetId;
            }
            return false;
          });
        }),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 5000,
    gcTime: 1 * 5000,
  });
}
