import { useQuery } from '@tanstack/react-query';
import { useLeatherConnect } from '~/store/addresses';

import { AccountRequest } from '@leather.io/services';
import { createBtcBalanceQueryConfig } from '@leather.io/queries';
import { useUserSettings } from '~/hooks/use-user-settings';

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
