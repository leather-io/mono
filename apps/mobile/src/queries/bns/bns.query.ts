import { toFetchState } from '@/components/loading';
import { useAccountAddresses } from '@/hooks/use-account-addresses';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountRequest, getBnsService } from '@leather.io/services';
import { hoursInMs } from '@leather.io/utils';

export function useAccountPrimaryBnsProfile(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useGetAccountPrimaryBnsProfileQuery({ account }));
}

export function useAccountBnsNames(fingerprint: string, accountIndex: number) {
  const account = useAccountAddresses(fingerprint, accountIndex);
  return toFetchState(useGetAccountBnsNamesQuery({ account }));
}

function useGetAccountPrimaryBnsProfileQuery(request: AccountRequest) {
  return useQuery({
    queryKey: ['bns-service-get-account-primary-bns-profile', request.account.stacks],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBnsService().getAccountPrimaryBnsProfile(request, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: hoursInMs(1),
    gcTime: hoursInMs(1),
  });
}

function useGetAccountBnsNamesQuery(request: AccountRequest) {
  return useQuery({
    queryKey: ['bns-service-get-account-bns-names', request.account.stacks],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBnsService().getAccountBnsNames(request, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: hoursInMs(1),
    gcTime: hoursInMs(1),
  });
}
