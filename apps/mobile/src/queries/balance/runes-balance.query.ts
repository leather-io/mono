import { useTotalBitcoinAccountServiceRequests } from '@/hooks/use-bitcoin-account-service-requests';
import { toFetchState } from '@/shared/fetch-state';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { BitcoinAccountIdentifier, getRunesBalancesService } from '@leather.io/services';

export function useRunesTotalBalance() {
  // TODO LEA-1982: check with Alex once we have xpub-based runes endpoint from BIS
  const accounts = useTotalBitcoinAccountServiceRequests();
  return toFetchState(useRunesAggregateBalanceQuery(accounts.map(account => account.account)));
}

export function useRunesAggregateBalance(accounts: BitcoinAccountIdentifier[]) {
  return toFetchState(useRunesAggregateBalanceQuery(accounts));
}

export function useRunesAccountBalance(account: BitcoinAccountIdentifier) {
  return toFetchState(useRunesAccountBalanceQuery(account));
}

export function useRunesAggregateBalanceQuery(accounts: BitcoinAccountIdentifier[]) {
  return useQuery({
    queryKey: ['runes-balances-service-get-runes-aggregate-balance', accounts],
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

export function useRunesAccountBalanceQuery(account: BitcoinAccountIdentifier) {
  return useQuery({
    queryKey: ['runes-balances-service-get-runes-account-balance', account],
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
