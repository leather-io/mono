import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountAddresses } from '@leather.io/models';
import { getActivityService } from '@leather.io/services';

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
