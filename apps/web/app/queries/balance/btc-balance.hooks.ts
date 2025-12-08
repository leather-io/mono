import { useQuery } from '@tanstack/react-query';
import { useUserSettings } from '~/hooks/use-user-settings';
import { useLeatherConnect } from '~/store/addresses';

import { createBtcBalanceQueryConfig } from '@leather.io/queries';
import { AccountRequest } from '@leather.io/services';

function useGetBtcAccountBalanceQuery(request: AccountRequest) {
  const settings = useUserSettings();
  return useQuery({
    ...createBtcBalanceQueryConfig(request, settings),
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
