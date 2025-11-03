import { QueryFunctionContext, useQuery } from '@tanstack/react-query';
import { useLeatherConnect } from '~/store/addresses';

import { AccountRequest, getBtcBalancesService } from '@leather.io/services';

function useGetBtcAccountBalanceQuery(request: AccountRequest) {
  return useQuery({
    queryKey: ['btc-balances-service-get-btc-account-balance', request],
    queryFn: ({ signal }: QueryFunctionContext) =>
      getBtcBalancesService().getBtcAccountBalance(request, signal),
    enabled:
      !!request.account.bitcoin?.taprootDescriptor &&
      !!request.account.bitcoin?.nativeSegwitDescriptor,
  });
}

export function useBtcAccountBalance() {
  const { btcAccount } = useLeatherConnect();
  const query = useGetBtcAccountBalanceQuery({ account: btcAccount });

  return query;
}
