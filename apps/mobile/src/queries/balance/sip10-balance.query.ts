import { toFetchState } from '@/shared/fetch-state';
import {
  useStacksSignerAddressFromAccountIndex,
  useStacksSignerAddresses,
} from '@/store/keychains/stacks/stacks-keychains.read';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { getSip10BalancesService } from '@leather.io/services';
import { createMoney } from '@leather.io/utils';

export function useSip10TotalBalance() {
  const addresses = useStacksSignerAddresses();
  return toFetchState(useSip10AggregateBalanceQuery(addresses));
}

export function useSip10AggregateBalance(addresses: string[]) {
  return toFetchState(useSip10AggregateBalanceQuery(addresses));
}

export function useSip10AccountBalance(fingerprint: string, accountIndex: number) {
  const address = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex) ?? '';
  if (!address) {
    throw new Error('Stacks address not found');
  }
  return toFetchState(useSip10AddressBalanceQuery(address));
}
export function useSip10AggregateAvailableBalance(addresses: string[]) {
  const { isLoading, data } = useSip10AggregateBalanceQuery(addresses);
  return !isLoading && data?.usd ? data.usd.availableBalance : createMoney(0, 'USD');
}

export function useSip10AggregateBalanceQuery(addresses: string[]) {
  // console.log('useSip10AggregateBalanceQuery addresses', addresses);
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

export function useSip10AddressBalanceQuery(address: string) {
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
