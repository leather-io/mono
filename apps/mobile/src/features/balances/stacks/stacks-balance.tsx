import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import { useStxAccountBalance, useStxTotalBalance } from '@/queries/balance/stx-balance.query';
import { t } from '@lingui/core/macro';

import { StxAvatarIcon } from '@leather.io/ui/native';

type StacksTokenBalanceProps = Omit<TokenBalanceProps, 'ticker' | 'tokenName' | 'icon'>;
export function StacksTokenBalance(props: StacksTokenBalanceProps) {
  return <TokenBalance ticker="STX" icon={<StxAvatarIcon />} tokenName={t`Stacks`} {...props} />;
}

interface StacksBalanceProps {
  onPress?: (tokenId: string) => void;
}

export function StacksBalance({ onPress }: StacksBalanceProps) {
  const { state, value } = useStxTotalBalance();

  const availableBalance = value?.stx.availableUnlockedBalance;
  const quoteBalance = value?.quote.availableUnlockedBalance;
  if (!availableBalance || !quoteBalance) {
    return null;
  }
  return (
    <StacksTokenBalance
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      onPress={() => onPress?.('STX')}
      isLoading={state === 'loading'}
    />
  );
}

interface StacksBalanceByAccountProps {
  accountIndex: number;
  fingerprint: string;
  onPress?: (tokenId: string) => void;
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
      onPress={() => onPress?.('STX')}
      isLoading={state === 'loading'}
    />
  );
}
