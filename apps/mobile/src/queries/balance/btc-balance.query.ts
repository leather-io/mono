import {
  useBitcoinAccountServiceRequest,
  useTotalBitcoinAccountServiceRequests,
  useWalletBitcoinAccountServiceRequests,
} from '@/hooks/use-bitcoin-account-service-requests';
import { toFetchState } from '@/shared/fetch-state';
import { useSettings } from '@/store/settings/settings';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { BitcoinAccountServiceRequest, getBtcBalancesService } from '@leather.io/services';

export function useBtcTotalBalance() {
  const serviceRequests = useTotalBitcoinAccountServiceRequests();
  return toFetchState(useBtcAggregateBalanceQuery(serviceRequests));
}

export function useBtcWalletBalance(fingerprint: string) {
  const serviceRequests = useWalletBitcoinAccountServiceRequests(fingerprint);
  return toFetchState(useBtcAggregateBalanceQuery(serviceRequests));
}

export function useBtcAccountBalance(fingerprint: string, accountIndex: number) {
  const serviceRequest = useBitcoinAccountServiceRequest(fingerprint, accountIndex);
  return toFetchState(useBtcAccountBalanceQuery(serviceRequest));
}

export function useBtcAccountBalanceQuery(serviceRequest: BitcoinAccountServiceRequest) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: [
      'btc-balance-service-get-btc-account-balance',
      serviceRequest,
      fiatCurrencyPreference,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBtcBalancesService().getBtcAccountBalance(serviceRequest, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}

export function useBtcAggregateBalanceQuery(serviceRequests: BitcoinAccountServiceRequest[]) {
  const { fiatCurrencyPreference } = useSettings();
  return useQuery({
    queryKey: [
      'btc-balance-service-get-btc-aggregate-balance',
      serviceRequests,
      fiatCurrencyPreference,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBtcBalancesService().getBtcAggregateBalance(serviceRequests, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}
