import { AccountRequest } from '@leather.io/services';

import { useGetAccountTotalBalanceQuery as useSharedGetAccountTotalBalanceQuery } from '@leather.io/features';

export function useGetAccountTotalBalanceQuery(request: AccountRequest) {
  return useSharedGetAccountTotalBalanceQuery(request, {});
}
