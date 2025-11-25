import { type QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { type AccountRequest, getUtxosService } from '@leather.io/services';
import { minutesInMs, secondsInMs } from '@leather.io/utils';

import { useCurrentNetworkState } from '@app/store/networks/networks.hooks';

const queryOptions = {
  staleTime: secondsInMs(10),
  gcTime: minutesInMs(5),
  refetchOnWindowFocus: false,
  refetchOnMount: true,
};

export function useGetAccountUtxosQuery(request: AccountRequest) {
  const network = useCurrentNetworkState();
  return useQuery({
    queryKey: [
      'utxos-service-get-account-utxos',
      network.id,
      request.account.id.fingerprint,
      request.account.id.accountIndex,
      request.exclusions,
      request.protections,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getUtxosService().getAccountUtxos(request, signal),
    ...queryOptions,
  });
}
