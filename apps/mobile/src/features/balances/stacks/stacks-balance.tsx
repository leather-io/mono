import { useStxAccountBalance, useStxTotalBalance } from '@/queries/balance/stx-balance.query';
import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';
import { PressableProps, StxAvatarIcon } from '@leather.io/ui/native';

import { TokenBalance } from '../token-balance';

interface StacksTokenBalanceProps extends PressableProps {
  availableBalance?: Money;
  fiatBalance?: Money;
  lockedBalance?: Money;
  fiatLockedBalance?: Money;
  isLoading?: boolean;
}
export function StacksTokenBalance({
  availableBalance,
  fiatBalance,
  lockedBalance,
  fiatLockedBalance,
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
      protocol="nativeStx"
      fiatBalance={fiatBalance}
      availableBalance={availableBalance}
      lockedBalance={lockedBalance}
      fiatLockedBalance={fiatLockedBalance}
      isLoading={isLoading}
      {...rest}
    />
  );
}

interface StacksBalanceProps {
  onPress?(): void;
}

export function StacksBalance({ onPress }: StacksBalanceProps) {
  const { state, value } = useStxTotalBalance();

  const availableBalance = value?.stx.availableBalance;
  const fiatBalance = value?.fiat.availableBalance;
  const lockedBalance = value?.stx.lockedBalance;
  const fiatLockedBalance = value?.fiat.lockedBalance;

  return (
    <StacksTokenBalance
      availableBalance={availableBalance}
      fiatBalance={fiatBalance}
      lockedBalance={lockedBalance}
      fiatLockedBalance={fiatLockedBalance}
      onPress={onPress}
      isLoading={state === 'loading'}
    />
  );
}

interface StacksBalanceByAccountProps {
  accountIndex: number;
  fingerprint: string;
  onPress?(): void;
}
export function StacksBalanceByAccount({
  accountIndex,
  fingerprint,
  onPress,
}: StacksBalanceByAccountProps) {
  const { state, value } = useStxAccountBalance(fingerprint, accountIndex);

  const availableBalance = value?.stx.availableBalance;
  const fiatBalance = value?.fiat.availableBalance;
  const lockedBalance = value?.stx.lockedBalance;
  const fiatLockedBalance = value?.fiat.lockedBalance;

  return (
    <StacksTokenBalance
      availableBalance={availableBalance}
      fiatBalance={fiatBalance}
      lockedBalance={lockedBalance}
      fiatLockedBalance={fiatLockedBalance}
      onPress={onPress}
      isLoading={state === 'loading'}
    />
  );
}
