import { toFetchState } from '@/shared/fetch-state';
import {
  useStacksSignerAddressFromAccountIndex,
  useStacksSignerAddresses,
} from '@/store/keychains/stacks/stacks-keychains.read';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { getStxBalancesService } from '@leather.io/services';

export function useStxTotalBalance() {
  const addresses = useStacksSignerAddresses();
  return toFetchState(useStxAggregateBalanceQuery(addresses));
}

export function useStxAccountBalance(fingerprint: string, accountIndex: number) {
  const address = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex) ?? '';
  if (!address) {
    throw new Error('Stacks address not found');
  }
  return toFetchState(useStxAddressBalanceQuery(address));
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

export function useStxAddressBalanceQuery(address: string) {
  return useQuery({
    queryKey: ['stx-balances-service-get-stx-address-balance', address],
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
