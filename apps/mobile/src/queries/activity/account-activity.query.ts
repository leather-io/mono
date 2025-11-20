import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountAddresses, CryptoAsset } from '@leather.io/models';
import { getActivityService } from '@leather.io/services';
import {
  useAccountActivity as useSharedAccountActivity,
  useAccountActivityQuery as useSharedAccountActivityQuery,
} from '@leather.io/features';

/**
 * @deprecated useTotalActivity is not used now we have moved to single account view
 * @see useAccountActivity
 */

export function useTotalActivity() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useTotalActivityQuery(accounts));
}

export function useTotalActivityByAsset(asset: CryptoAsset) {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useTotalActivityByAssetQuery(accounts, asset));
}

export function useAccountActivity(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  const { fiatCurrencyPreference } = useSettings();
  return toFetchState(
    useSharedAccountActivity(account, { queryKeyContext: [fiatCurrencyPreference] })
  );
}

export function useAccountActivityByAsset(
  fingerprint: string,
  accountIndex: number,
  asset: CryptoAsset
) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useAccountActivityByAssetQuery(account, asset));
}

/**
 * @deprecated useTotalActivityQuery is not used now we have moved to single account view
 * @see useAccountActivityQuery
 */
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
  return useSharedAccountActivityQuery(account, {
    queryKeyContext: [fiatCurrencyPreference],
  });
}

/**
 * @deprecated useTotalActivityByAssetQuery is not used now we have moved to single account view
 * @see useAccountActivityByAssetQuery
 */
export function useTotalActivityByAssetQuery(accounts: AccountAddresses[], asset: CryptoAsset) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: [
      'activity-service-get-total-activity-by-asset',
      accounts,
      asset,
      fiatCurrencyPreference,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getActivityService().getTotalActivityByAsset(accounts, asset, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 5000,
    gcTime: 1 * 5000,
  });
}

export function useAccountActivityByAssetQuery(account: AccountAddresses, asset: CryptoAsset) {
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
