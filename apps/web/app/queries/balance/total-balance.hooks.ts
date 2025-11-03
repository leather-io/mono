import { useGetAccountTotalBalanceQuery } from '~/store/account';
import { useLeatherConnect } from '~/store/addresses';

import { Money } from '@leather.io/models';

export function useTotalPortfolioBalance(): Money | undefined {
  const { stacksAccount } = useLeatherConnect();

  const { data } = useGetAccountTotalBalanceQuery({
    account: {
      id: { fingerprint: 'web-sdk', accountIndex: 0 },
      stacks: stacksAccount ? { stxAddress: stacksAccount.address } : undefined,
    },
  });

  return data;
}
