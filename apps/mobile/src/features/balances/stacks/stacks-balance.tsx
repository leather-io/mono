import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import { useStxAccountBalance } from '@/queries/balance/stx-balance.query';
import { t } from '@lingui/core/macro';

import { AccountId } from '@leather.io/models';
import { StacksFilledCircleIcon, StxAvatarIcon } from '@leather.io/ui/native';

type StacksTokenBalanceProps = Omit<TokenBalanceProps, 'ticker' | 'tokenName' | 'icon'>;
export function StacksTokenBalance(props: StacksTokenBalanceProps) {
  return (
    <TokenBalance
      ticker="STX"
      icon={<StxAvatarIcon indicator={<StacksFilledCircleIcon variant="small" />} />}
      tokenName={t`Stacks`}
      {...props}
    />
  );
}

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
