import { useTotalBalance } from '@/hooks/balances/use-total-balance';
import { MockedAccount } from '@/mocks/account.mocks';
import { t } from '@lingui/macro';

import { Token } from './types';

export function useGetTokensList(accounts: MockedAccount[]): Token[] {
  const { btcBalance, btcBalanceUsd, stxBalance, stxBalanceUsd } = useTotalBalance(accounts);
  return [
    {
      chain: t`Stacks blockchain`,
      availableBalance: {
        availableBalance: stxBalance,
      },
      fiatBalance: stxBalanceUsd,
      ticker: 'stx',
      tokenName: t`Stacks`,
    },
    {
      chain: t`Bitcoin`,
      availableBalance: {
        availableBalance: btcBalance,
      },
      fiatBalance: btcBalanceUsd,
      ticker: 'btc',
      tokenName: t`Bitcoin`,
    },
  ];
}
