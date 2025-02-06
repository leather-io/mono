import {
  useBitcoinAccountServiceRequest,
  useTotalBitcoinAccountServiceRequests,
  useWalletBitcoinAccountServiceRequests,
} from '@/hooks/use-bitcoin-account-service-requests';
import { toFetchState } from '@/shared/fetch-state';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { BitcoinAccountIdentifier, getRunesBalancesService } from '@leather.io/services';

export function useRunesTotalBalance() {
  // TODO LEA-1982: check with Alex once we have xpub-based runes endpoint from BIS
  const totalRequests = useTotalBitcoinAccountServiceRequests();
  return toFetchState(useRunesAggregateBalanceQuery(totalRequests.map(r => r.account)));
}

export function useRunesWalletBalance(fingerprint: string) {
  const walletRequests = useWalletBitcoinAccountServiceRequests(fingerprint);
  return toFetchState(useRunesAggregateBalanceQuery(walletRequests.map(r => r.account)));
}

export function useRunesAccountBalance(fingerprint: string, accountIndex: number) {
  const accountRequest = useBitcoinAccountServiceRequest(fingerprint, accountIndex);
  return toFetchState(useRunesAccountBalanceQuery(accountRequest.account));
}

export function useRunesAggregateBalanceQuery(accounts: BitcoinAccountIdentifier[]) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: [
      'runes-balances-service-get-runes-aggregate-balance',
      accounts,
      fiatCurrencyPreference,
    ],
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
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: ['runes-balances-service-get-runes-account-balance', account, fiatCurrencyPreference],
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
