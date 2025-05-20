import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountAddresses, CryptoAssetInfo } from '@leather.io/models';
import { getActivityService } from '@leather.io/services';

/**
 * Keeping this as an example of services usage
 * @knipignore */
export function useTotalActivity() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useTotalActivityQuery(accounts));
}

/**
 * Keeping this as an example of services usage
 * @knipignore */
export function useAccountActivity(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useAccountActivityQuery(account));
}

/**
 * Keeping this as an example of services usage
 * @knipignore */
export function useActivityByAsset(
  fingerprint: string,
  accountIndex: number,
  asset: CryptoAssetInfo
) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useActivityByAssetQuery(account, asset));
}

export function useTotalActivityQuery(accounts: AccountAddresses[]) {
  const { quoteCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['activity-service-get-total-activity', accounts, quoteCurrencyPreference],
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
  const { quoteCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['activity-service-get-account-activity', account, quoteCurrencyPreference],
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

/**
 * Keeping this as an example of services usage
 * @knipignore */
export function useActivityByAssetQuery(account: AccountAddresses, asset: CryptoAssetInfo) {
  const { quoteCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['activity-service-get-activity-by-asset', account, asset, quoteCurrencyPreference],
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
