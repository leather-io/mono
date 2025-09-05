import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountRequest, getBtcBalancesService } from '@leather.io/services';

import { balanceQueryOptions } from './balance-query-options';

export function useBtcTotalBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useBtcAggregateBalanceQuery(accounts.map(account => ({ account }))));
}
/**
 * @deprecated useBtcTotalNativeSegwitBalance is not used now we have moved to single account view
 * @see useBtcAccountNativeSegwitBalance
 */
export function useBtcTotalNativeSegwitBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(
    useBtcAggregateBalanceQuery(
      accounts.map(account => ({
        account,
        exclusions: { taprootAddresses: true },
      }))
    )
  );
}

/**
 * @deprecated useBtcTotalTaprootBalance is not used now we have moved to single account view
 * @see useBtcAccountTaprootBalance
 */
export function useBtcTotalTaprootBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(
    useBtcAggregateBalanceQuery(
      accounts.map(account => ({
        account,
        exclusions: { nativeSegwitAddresses: true },
      }))
    )
  );
}

export function useBtcAccountBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useBtcAccountBalanceQuery({ account }));
}

export function useBtcAccountNativeSegwitBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(
    useBtcAccountBalanceQuery({
      account,
      exclusions: { taprootAddresses: true },
    })
  );
}

export function useBtcAccountTaprootBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(
    useBtcAccountBalanceQuery({
      account,
      exclusions: { nativeSegwitAddresses: true },
    })
  );
}

export function useBtcAccountBalanceQuery(request: AccountRequest) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['btc-balance-service-get-btc-account-balance', request, fiatCurrencyPreference],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBtcBalancesService().getBtcAccountBalance(request, signal),
    ...balanceQueryOptions,
  });
}

function useBtcAggregateBalanceQuery(requests: AccountRequest[]) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['btc-balance-service-get-btc-aggregate-balance', requests, fiatCurrencyPreference],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBtcBalancesService().getBtcAggregateBalance(requests, signal),
    ...balanceQueryOptions,
  });
}
