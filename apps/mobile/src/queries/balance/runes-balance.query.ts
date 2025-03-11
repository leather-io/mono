import {
  useAccountAddresses,
  useTotalAccountAddresses,
  useWalletAccountAddresses,
} from '@/hooks/use-account-addresses';
import { toFetchState } from '@/shared/fetch-state';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountAddresses } from '@leather.io/models';
import { getRunesBalancesService } from '@leather.io/services';

export function useRunesTotalBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useRunesAggregateBalanceQuery(accounts));
}

export function useRunesWalletBalance(fingerprint: string) {
  const accounts = useWalletAccountAddresses(fingerprint);
  return toFetchState(useRunesAggregateBalanceQuery(accounts));
}

export function useRunesAccountBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useRunesAccountBalanceQuery(account));
}

export function useRunesAggregateBalanceQuery(accounts: AccountAddresses[]) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: [
      'runes-balances-service-get-runes-aggregate-balance',
      accounts,
      fiatCurrencyPreference,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getRunesBalancesService().getRunesAggregateBalance(accounts, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}

export function useRunesAccountBalanceQuery(account: AccountAddresses) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['runes-balances-service-get-runes-account-balance', account, fiatCurrencyPreference],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getRunesBalancesService().getRunesAccountBalance(account, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}
