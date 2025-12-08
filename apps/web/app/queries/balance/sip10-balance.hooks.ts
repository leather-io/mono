import { useQuery } from '@tanstack/react-query';
import { useLeatherConnect } from '~/store/addresses';

import { AccountRequest } from '@leather.io/services';
import { createSip10AccountBalanceQueryConfig } from '@leather.io/queries';
import { useUserSettings } from '~/hooks/use-user-settings';

interface UseSip10AccountBalanceOptions {
  includeHiddenAssets?: boolean;
}

function useGetSip10AccountBalanceQuery(
  request: AccountRequest,
  options?: UseSip10AccountBalanceOptions
) {
  const settings = useUserSettings();
  return useQuery({
    ...createSip10AccountBalanceQueryConfig(request, settings),
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
