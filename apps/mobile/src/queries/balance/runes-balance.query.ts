import { toFetchState } from '@/components/loading/fetch-state';
import { useRunesFlag } from '@/features/feature-flags';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountRequest, getRunesBalancesService } from '@leather.io/services';

/**
 * @deprecated useRunesTotalBalance is not used now we have moved to single account view
 * @see useRunesAccountBalance
 */
export function useRunesTotalBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useRunesAggregateBalanceQuery(accounts.map(account => ({ account }))));
}

export function useRunesAccountBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useRunesAccountBalanceQuery({ account }));
}

function useRunesAggregateBalanceQuery(requests: AccountRequest[]) {
  const { fiatCurrencyPreference } = useSettings();
  const runeFlag = useRunesFlag();
  return useQuery({
    queryKey: [
      'runes-balances-service-get-runes-aggregate-balance',
      requests,
      fiatCurrencyPreference,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getRunesBalancesService().getRunesAggregateBalance(requests, signal),
    enabled: runeFlag,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}

function useRunesAccountBalanceQuery(request: AccountRequest) {
  const { fiatCurrencyPreference } = useSettings();
  const runeFlag = useRunesFlag();
  return useQuery({
    queryKey: ['runes-balances-service-get-runes-account-balance', request, fiatCurrencyPreference],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getRunesBalancesService().getRunesAccountBalance(request, signal),
    enabled: runeFlag,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}
