import { StxAvatarIcon } from '@leather.io/ui';

import { useStxAccountBalance } from '@app/query/stacks/balance/stx-balance.hooks';

import { TokenBalance } from './token-balance';

interface StacksBalanceProps {
  accountIndex: number;
  onClick?(): void;
}

export function StacksBalance({ accountIndex, onClick }: StacksBalanceProps) {
  const balance = useStxAccountBalance(accountIndex);

  const availableBalance = balance.value?.stx.availableUnlockedBalance;
  const quoteBalance = balance.value?.quote.availableUnlockedBalance;

  if (!availableBalance || !quoteBalance) return null;

  return (
    <TokenBalance
      icon={<StxAvatarIcon />}
      tokenName="Stacks"
      ticker="STX"
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      isLoading={balance.state === 'loading'}
      onClick={onClick}
    />
  );
}
