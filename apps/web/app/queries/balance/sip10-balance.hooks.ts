import { QueryFunctionContext, useQuery } from '@tanstack/react-query';
import { useLeatherConnect } from '~/store/addresses';

import { AccountRequest, getSip10BalancesService } from '@leather.io/services';

interface UseSip10AccountBalanceOptions {
  includeHiddenAssets?: boolean;
}

function useGetSip10AccountBalanceQuery(
  request: AccountRequest,
  options?: UseSip10AccountBalanceOptions
) {
  return useQuery({
    queryKey: [
      'sip10-balances-service-get-sip10-account-balance',
      request,
      options?.includeHiddenAssets,
    ],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getSip10BalancesService().getSip10AccountBalance(request, signal),
    enabled: !!request.account.stacks?.stxAddress,
  });
}

export function useSip10AccountBalance(options?: UseSip10AccountBalanceOptions) {
  const { stacksAccount } = useLeatherConnect();

  const query = useGetSip10AccountBalanceQuery(
    {
      account: {
        id: { fingerprint: 'web-sdk', accountIndex: 0 },
        stacks: stacksAccount ? { stxAddress: stacksAccount.address } : undefined,
      },
      assets: { includeHiddenAssets: options?.includeHiddenAssets },
    },
    options
  );

  return query;
}
