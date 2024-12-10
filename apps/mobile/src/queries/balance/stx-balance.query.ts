import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { getStxBalancesService } from '@leather.io/services';
import { createMoney } from '@leather.io/utils';

export function useStxBalance(addresses: string[]) {
  const { isLoading, data: aggregateBalance } = useStxAggregateBalanceQuery(addresses);
  return {
    availableBalance:
      !isLoading && aggregateBalance
        ? aggregateBalance.stx.availableBalance
        : createMoney(0, 'STX'),
    fiatBalance:
      !isLoading && aggregateBalance
        ? aggregateBalance.usd.availableBalance
        : createMoney(0, 'USD'),
  };
}

export function useStxAggregateBalanceQuery(addresses: string[]) {
  return useQuery({
    queryKey: ['stx-balances-service-get-stx-aggregate-balance', addresses],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getStxBalancesService().getStxAggregateBalance(addresses, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}

export function useStxBalanceQuery(address: string) {
  return useQuery({
    queryKey: ['stx-balances-service-get-stx-balance', address],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getStxBalancesService().getStxAddressBalance(address, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}
