import { toFetchState } from '@/components/loading';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountAddresses } from '@leather.io/models';
import { getActivityService } from '@leather.io/services';

export function useSip10TotalActivityByAssetId(assetId: string) {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useSip10TotalActivityByAssetIdQuery(accounts, assetId));
}

export function useSip10ActivityByAssetId(
  fingerprint: string,
  accountIndex: number,
  assetId: string
) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useSip10ActivityByAssetIdQuery(account, assetId));
}

export function useSip10TotalActivityByAssetIdQuery(accounts: AccountAddresses[], assetId: string) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: [
      'activity-service-get-sip10-total-activity-by-asset-id',
      accounts,
      assetId,
      fiatCurrencyPreference,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getActivityService().getTotalSip10ActivityByAssetId(accounts, assetId, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 5000,
    gcTime: 1 * 5000,
  });
}

export function useSip10ActivityByAssetIdQuery(account: AccountAddresses, assetId: string) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: [
      'activity-service-get-sip10-activity-by-asset-id',
      account,
      assetId,
      fiatCurrencyPreference,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getActivityService().getSip10ActivityByAssetId(account, assetId, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 5000,
    gcTime: 1 * 5000,
  });
}
