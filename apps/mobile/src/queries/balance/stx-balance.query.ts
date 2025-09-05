import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountRequest, getStxBalancesService } from '@leather.io/services';

import { balanceQueryOptions } from './balance-query-options';

export function useStxTotalBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useStxAggregateBalanceQuery(accounts.map(account => ({ account }))));
}

export function useStxAccountBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useStxAccountBalanceQuery({ account }));
}

function useStxAggregateBalanceQuery(requests: AccountRequest[]) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['stx-balances-service-get-stx-aggregate-balance', requests, fiatCurrencyPreference],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getStxBalancesService().getStxAggregateBalance(requests, signal),
    ...balanceQueryOptions,
  });
}

export function useStxAccountBalanceQuery(request: AccountRequest) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['stx-balances-service-get-stx-account-balance', request, fiatCurrencyPreference],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getStxBalancesService().getStxAccountBalance(request, signal),
    ...balanceQueryOptions,
  });
}
