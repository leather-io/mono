import { useQuery } from '@tanstack/react-query';
import { useLeatherConnect } from '~/store/addresses';

import { AccountRequest } from '@leather.io/services';
import { createStxAccountBalanceQueryConfig } from '@leather.io/queries';
import { useUserSettings } from '~/hooks/use-user-settings';

function useGetStxAccountBalanceQuery(request: AccountRequest) {
  const settings = useUserSettings();
  return useQuery({
    ...createStxAccountBalanceQueryConfig(request, settings),
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
