import { TokenBalance } from '@/features/token/components/token-balance';
import { useStxAccountBalance, useStxTotalBalance } from '@/queries/balance/stx-balance.query';
import { t } from '@lingui/macro';

import { stxAsset } from '@leather.io/constants';
import { Money } from '@leather.io/models';
import { PressableProps, StxAvatarIcon } from '@leather.io/ui/native';

import { OnOpenTokenProps } from '../balances';

interface StacksTokenBalanceProps extends PressableProps {
  availableBalance?: Money;
  quoteBalance?: Money;
  isLoading?: boolean;
}
export function StacksTokenBalance({
  availableBalance,
  quoteBalance,
  isLoading,
  ...rest
}: StacksTokenBalanceProps) {
  return (
    <TokenBalance
      ticker="STX"
      icon={<StxAvatarIcon />}
      tokenName={t({
        id: 'asset_name.stacks',
        message: 'Stacks',
      })}
      quoteBalance={quoteBalance}
      availableBalance={availableBalance}
      isLoading={isLoading}
      {...rest}
    />
  );
}

interface StacksBalanceProps {
  onPress?: ({ asset, availableBalance, quoteBalance }: OnOpenTokenProps) => void;
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
      onPress={() => onPress?.({ asset: stxAsset, availableBalance, quoteBalance })}
      isLoading={state === 'loading'}
    />
  );
}

interface StacksBalanceByAccountProps {
  accountIndex: number;
  fingerprint: string;
  onPress?: ({ asset, availableBalance, quoteBalance }: OnOpenTokenProps) => void;
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
      onPress={() => onPress?.({ asset: stxAsset, availableBalance, quoteBalance })}
      isLoading={state === 'loading'}
    />
  );
}
