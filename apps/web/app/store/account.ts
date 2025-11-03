import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { AccountRequest, getAccountBalancesService } from '@leather.io/services';

export function useGetAccountTotalBalanceQuery(request: AccountRequest) {
  return useQuery({
    queryKey: ['account-balances-service-get-total-balance', request],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getAccountBalancesService().getTotalBalance(request, signal),
  });
}
