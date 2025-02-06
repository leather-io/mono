import { toFetchState } from '@/shared/fetch-state';
import {
  useStacksSignerAddressFromAccountIndex,
  useStacksSignerAddresses,
} from '@/store/keychains/stacks/stacks-keychains.read';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { getSip10BalancesService } from '@leather.io/services';

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

export function useSip10AggregateBalanceQuery(addresses: string[]) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: [
      'sip10-balances-service-get-sip10-aggregate-balance',
      addresses,
      fiatCurrencyPreference,
    ],
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
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['sip10-balances-service-get-sip10-address-balance', address, fiatCurrencyPreference],
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
