import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { toFetchState } from '@/shared/fetch-state';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountAddresses, CryptoAssetInfo } from '@leather.io/models';
import { getActivityService } from '@leather.io/services';

export function useTotalActivity() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useTotalActivityQuery(accounts));
}

export function useAccountActivity(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useAccountActivityQuery(account));
}

export function useActivityByAsset(
  fingerprint: string,
  accountIndex: number,
  asset: CryptoAssetInfo
) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useActivityByAssetQuery(account, asset));
}

export function useTotalActivityQuery(accounts: AccountAddresses[]) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['activity-service-get-total-activity', accounts, fiatCurrencyPreference],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getActivityService().getTotalActivity(accounts, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 5000,
    gcTime: 1 * 5000,
  });
}

export function useAccountActivityQuery(account: AccountAddresses) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['activity-service-get-account-activity', account, fiatCurrencyPreference],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getActivityService().getAccountActivity(account, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 5000,
    gcTime: 1 * 5000,
  });
}

export function useActivityByAssetQuery(account: AccountAddresses, asset: CryptoAssetInfo) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['activity-service-get-activity-by-asset', account, asset, fiatCurrencyPreference],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getActivityService().getActivityByAsset(account, asset, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 5000,
    gcTime: 1 * 5000,
  });
}
