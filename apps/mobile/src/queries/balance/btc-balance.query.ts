import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import {
  STABLE_QUERY_CONFIG,
  createQueryFunction,
  queryToFetchState,
} from '@/utils/query-error-handler';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountRequest, getBtcBalancesService } from '@leather.io/services';

export function useBtcTotalBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(
    queryToFetchState(useBtcAggregateBalanceQuery(accounts.map(account => ({ account }))))
  );
}
/**
 * @deprecated useBtcTotalNativeSegwitBalance is not used now we have moved to single account view
 * @see useBtcAccountNativeSegwitBalance
 */
export function useBtcTotalNativeSegwitBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(
    queryToFetchState(
      useBtcAggregateBalanceQuery(
        accounts.map(account => ({
          account,
          exclusions: { taprootAddresses: true },
        }))
      )
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
    queryToFetchState(
      useBtcAggregateBalanceQuery(
        accounts.map(account => ({
          account,
          exclusions: { nativeSegwitAddresses: true },
        }))
      )
    )
  );
}

export function useBtcAccountBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(queryToFetchState(useBtcAccountBalanceQuery({ account })));
}

export function useBtcAccountNativeSegwitBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(
    queryToFetchState(
      useBtcAccountBalanceQuery({
        account,
        exclusions: { taprootAddresses: true },
      })
    )
  );
}

export function useBtcAccountTaprootBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(
    queryToFetchState(
      useBtcAccountBalanceQuery({
        account,
        exclusions: { nativeSegwitAddresses: true },
      })
    )
  );
}

export function useBtcAccountBalanceQuery(request: AccountRequest) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['btc-balance-service-get-btc-account-balance', request, fiatCurrencyPreference],
    queryFn: createQueryFunction(({ signal }: QueryFunctionContext) =>
      getBtcBalancesService().getBtcAccountBalance(request, signal)
    ),
    ...STABLE_QUERY_CONFIG,
  });
}

function useBtcAggregateBalanceQuery(requests: AccountRequest[]) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['btc-balance-service-get-btc-aggregate-balance', requests, fiatCurrencyPreference],
    queryFn: createQueryFunction(({ signal }: QueryFunctionContext) =>
      getBtcBalancesService().getBtcAggregateBalance(requests, signal)
    ),
    ...STABLE_QUERY_CONFIG,
  });
}
