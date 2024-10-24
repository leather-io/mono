import { useTotalBalance } from '@/features/accounts/balances/hooks/use-total-balance';
import { t } from '@lingui/macro';

import { Token } from './types';

export function useGetTokensList(): Token[] {
  const { btcBalance, btcBalanceUsd, stxBalance, stxBalanceUsd } = useTotalBalance();
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
