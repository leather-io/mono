import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { getSip10BalancesService } from '@leather.io/services';
import { createMoney } from '@leather.io/utils';

export function useSip10AggregateAvailableBalance(addresses: string[]) {
  const { isLoading, data: balance } = useSip10AggregateBalanceQuery(addresses);
  return !isLoading && balance ? balance.usd.availableBalance : createMoney(0, 'USD');
}

export function useSip10AggregateBalanceQuery(addresses: string[]) {
  return useQuery({
    queryKey: ['sip10-balances-service-get-sip10-aggregate-balance', addresses],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10AggregateBalance(addresses, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}

export function useSip10BalancesQuery(address: string) {
  return useQuery({
    queryKey: ['sip10-balances-service-get-sip10-address-balance', address],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10AddressBalance(address, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}
