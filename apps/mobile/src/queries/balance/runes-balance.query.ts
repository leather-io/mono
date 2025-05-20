import { toFetchState } from '@/components/loading/fetch-state';
import { useRunesFlag } from '@/features/feature-flags';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountAddresses } from '@leather.io/models';
import { getRunesBalancesService } from '@leather.io/services';

export function useRunesTotalBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useRunesAggregateBalanceQuery(accounts));
}

export function useRunesAccountBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useRunesAccountBalanceQuery(account));
}

function useRunesAggregateBalanceQuery(accounts: AccountAddresses[]) {
  const { quoteCurrencyPreference } = useSettings();
  const runeFlag = useRunesFlag();
  return useQuery({
    queryKey: [
      'runes-balances-service-get-runes-aggregate-balance',
      accounts,
      quoteCurrencyPreference,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getRunesBalancesService().getRunesAggregateBalance(accounts, signal),
    enabled: runeFlag,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}

function useRunesAccountBalanceQuery(account: AccountAddresses) {
  const { quoteCurrencyPreference } = useSettings();
  const runeFlag = useRunesFlag();
  return useQuery({
    queryKey: [
      'runes-balances-service-get-runes-account-balance',
      account,
      quoteCurrencyPreference,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getRunesBalancesService().getRunesAccountBalance(account, signal),
    enabled: runeFlag,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}
