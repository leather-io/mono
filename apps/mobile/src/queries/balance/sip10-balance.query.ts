import { toFetchState } from '@/components/loading/fetch-state';
import { useAccountAddresses, useTotalAccountAddresses } from '@/hooks/use-account-addresses';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountRequest, Sip10Balance, getSip10BalancesService } from '@leather.io/services';

export function useSip10TotalBalance() {
  const accounts = useTotalAccountAddresses();
  return toFetchState(useSip10AggregateBalanceQuery(accounts.map(account => ({ account }))));
}

export function useSip10AccountBalance(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useSip10AccountBalanceQuery({ account }));
}

function useSip10AggregateBalanceQuery(requests: AccountRequest[]) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: [
      'sip10-balances-service-get-sip10-aggregate-balance',
      requests,
      fiatCurrencyPreference,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10AggregateBalance(requests, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}

export function useSip10AccountBalanceQuery(request: AccountRequest) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['sip10-balances-service-get-sip10-account-balance', request, fiatCurrencyPreference],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10AccountBalance(request, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}

// TODO: Update services to return token specific balances for SIP-10
// centralising token specific filtering here temporarily
export function useSip10TotalBalanceByAsset(tokenId: string) {
  const addresses = useStacksSignerAddresses();
  return toFetchState(useSip10AggregateBalanceByAssetQuery(addresses, tokenId));
}

export function useSip10AccountBalanceByAsset(
  fingerprint: string,
  accountIndex: number,
  tokenId: string
) {
  const address = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex) ?? '';
  if (!address) {
    throw new Error('Stacks address not found');
  }
  return toFetchState(useSip10AddressBalanceByAssetQuery(address, tokenId));
}

function useSip10AggregateBalanceByAssetQuery(addresses: string[], tokenId: string) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: [
      `sip10-balances-service-get-sip10-aggregate-balance-${tokenId}`,
      addresses,
      fiatCurrencyPreference,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService()
        .getSip10AggregateBalance(addresses, signal)
        .then(data => data.sip10s.find((token: Sip10Balance) => token.asset.symbol === tokenId)),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}

function useSip10AddressBalanceByAssetQuery(address: string, tokenId: string) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: [
      `sip10-balances-service-get-sip10-address-balance-${tokenId}`,
      address,
      fiatCurrencyPreference,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService()
        .getSip10AddressBalance(address, signal)
        .then(data => data.sip10s.find((token: Sip10Balance) => token.asset.symbol === tokenId)),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}
