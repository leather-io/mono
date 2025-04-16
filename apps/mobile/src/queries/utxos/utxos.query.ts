import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { toFetchState } from '@/shared/fetch-state';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountAddresses } from '@leather.io/models';
import { getUtxosService } from '@leather.io/services';

export function useAccountUtxos(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useAccountUtxosQuery(account));
}

function useAccountUtxosQuery(account: AccountAddresses) {
  return useQuery({
    queryKey: ['utxos-service-get-account-utxos', account],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getUtxosService().getAccountUtxos(account, [], signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 1000,
    gcTime: 1 * 1000,
  });
}
