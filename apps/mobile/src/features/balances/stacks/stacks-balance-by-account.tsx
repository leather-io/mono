import { useStxAccountBalance } from '@/queries/balance/stx-balance.query';

import { AccountId } from '@leather.io/models';

import { StacksTokenBalance } from './stacks-token-balance';

interface StacksBalanceByAccountProps extends AccountId {
  onPress?(): void;
}

export function StacksBalanceByAccount({
  accountIndex,
  fingerprint,
  onPress,
}: StacksBalanceByAccountProps) {
  const { state, value } = useStxAccountBalance(fingerprint, accountIndex);

  const availableBalance = value?.stx.availableUnlockedBalance;
  const quoteBalance = value?.quote.availableUnlockedBalance;

  if (!availableBalance || !quoteBalance) {
    return null;
  }

  return (
    <StacksTokenBalance
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      onPress={onPress}
      isLoading={state === 'loading'}
    />
  );
}
