import { QueryFunctionContext, useQuery } from '@tanstack/react-query';
import { useLeatherConnect } from '~/store/addresses';

import { AccountRequest, getStxBalancesService } from '@leather.io/services';

function useGetStxAccountBalanceQuery(request: AccountRequest) {
  return useQuery({
    queryKey: ['stx-balances-service-get-stx-account-balance', request],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getStxBalancesService().getStxAccountBalance(request, signal),
    enabled: !!request.account.stacks?.stxAddress,
  });
}

export function useStxAccountBalance() {
  const { stacksAccount } = useLeatherConnect();

  const query = useGetStxAccountBalanceQuery({
    account: {
      id: { fingerprint: 'web-sdk', accountIndex: 0 },
      stacks: stacksAccount ? { stxAddress: stacksAccount.address } : undefined,
    },
  });

  return query;
}
