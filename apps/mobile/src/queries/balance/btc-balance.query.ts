import {
  useAccountAddresses,
  useTotalAccountAddresses,
  useWalletAccountAddresses,
} from '@/hooks/use-account-addresses';
import { toFetchState } from '@/shared/fetch-state';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountAddresses } from '@leather.io/models';
import { getBtcBalancesService } from '@leather.io/services';

export function useBtcTotalBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useBtcAggregateBalanceQuery(accounts));
}

export function useBtcWalletBalance(fingerprint: string) {
  const accounts = useWalletAccountAddresses(fingerprint);
  return toFetchState(useBtcAggregateBalanceQuery(accounts));
}

export function useBtcAccountBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useBtcAccountBalanceQuery(account));
}

export function useBtcAccountBalanceQuery(account: AccountAddresses) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['btc-balance-service-get-btc-account-balance', account, fiatCurrencyPreference],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBtcBalancesService().getBtcAccountBalance({ account, unprotectedUtxos: [] }, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}

export function useBtcAggregateBalanceQuery(accounts: AccountAddresses[]) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['btc-balance-service-get-btc-aggregate-balance', accounts, fiatCurrencyPreference],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBtcBalancesService().getBtcAggregateBalance(
        accounts.map(account => ({
          account,
          unprotectedUtxos: [],
        })),
        signal
      ),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}
