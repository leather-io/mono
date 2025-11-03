import { type QueryFunctionContext, useQuery } from '@tanstack/react-query';
import { useLeatherConnect } from '~/store/addresses';

import type { AccountAddresses } from '@leather.io/models';
import { getActivityService } from '@leather.io/services';

export function useAccountActivityQuery(account: AccountAddresses) {
  return useQuery({
    queryKey: ['activity-service-get-account-activity', account],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getActivityService().getAccountActivity(account, signal),
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retryOnMount: false,
    staleTime: 1 * 5000,
    gcTime: 1 * 5000,
  });
}

export function useAccountActivity() {
  const { stacksAccount, btcAddressP2tr, btcAddressP2wpkh } = useLeatherConnect();

  return useAccountActivityQuery({
    id: { fingerprint: 'web-sdk', accountIndex: 0 },
    stacks: stacksAccount ? { stxAddress: stacksAccount.address } : undefined,
    bitcoin:
      btcAddressP2tr && btcAddressP2wpkh
        ? {
            taprootDescriptor: btcAddressP2tr.descriptor,
            nativeSegwitDescriptor: btcAddressP2wpkh.descriptor,
          }
        : undefined,
  });
}
