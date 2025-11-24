import { type AccountRequest } from '@leather.io/services';

import { useGetBtcAccountBalanceQuery as useSharedGetBtcAccountBalanceQuery } from '@leather.io/features';

import { balanceQueryOptionsWithRefetch } from '@app/query/common/balance-query-options';
import { useCurrentNetworkState } from '@app/store/networks/networks.hooks';

export function useGetBtcAccountBalanceQuery(request: AccountRequest) {
  const network = useCurrentNetworkState();
  return useSharedGetBtcAccountBalanceQuery(request, {
    queryKeyContext: [
      network.id,
      request.account.id.fingerprint,
      request.account.id.accountIndex,
      request.exclusions,
      request.protections,
    ],
    ...balanceQueryOptionsWithRefetch,
  });
}
