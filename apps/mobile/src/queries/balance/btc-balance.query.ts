import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { BtcAccountRequest, getBtcBalancesService } from '@leather.io/services';

export function useBtcTotalBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(
    useBtcAggregateBalanceQuery(accounts.map(account => ({ account, unprotectedUtxos: [] })))
  );
}

export function useBtcTotalNativeSegwitBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(
    useBtcAggregateBalanceQuery(
      accounts.map(account => ({
        account,
        unprotectedUtxos: [],
        exclude: { taprootAddresses: true },
      }))
    )
  );
}

export function useBtcTotalTaprootBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(
    useBtcAggregateBalanceQuery(
      accounts.map(account => ({
        account,
        unprotectedUtxos: [],
        exclude: { nativeSegwitAddresses: true },
      }))
    )
  );
}

export function useBtcAccountBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useBtcAccountBalanceQuery({ account, unprotectedUtxos: [] }));
}

export function useBtcAccountNativeSegwitBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(
    useBtcAccountBalanceQuery({
      account,
      unprotectedUtxos: [],
      exclude: { taprootAddresses: true },
    })
  );
}

export function useBtcAccountTaprootBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(
    useBtcAccountBalanceQuery({
      account,
      unprotectedUtxos: [],
      exclude: { nativeSegwitAddresses: true },
    })
  );
}

function useBtcAccountBalanceQuery(request: BtcAccountRequest) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['btc-balance-service-get-btc-account-balance', request, fiatCurrencyPreference],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBtcBalancesService().getBtcAccountBalance(request, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}

function useBtcAggregateBalanceQuery(requests: BtcAccountRequest[]) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['btc-balance-service-get-btc-aggregate-balance', requests, fiatCurrencyPreference],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBtcBalancesService().getBtcAggregateBalance(requests, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}
