import { useBitcoinAccountServiceRequest } from '@/hooks/use-bitcoin-account-service-requests';
import { toFetchState } from '@/shared/fetch-state';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { BitcoinAccountServiceRequest, getUtxosService } from '@leather.io/services';

export function useAccountUtxos(fingerprint: string, accountIndex: number) {
  const request = useBitcoinAccountServiceRequest(fingerprint, accountIndex);
  return toFetchState(useAccountUtxosQuery(request));
}

export function useAccountUtxosQuery(request: BitcoinAccountServiceRequest) {
  return useQuery({
    queryKey: ['utxos-service-get-account-utxos', request],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getUtxosService().getAccountUtxos(request, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}
