import { useStxAccountBalance, useStxTotalBalance } from '@/queries/balance/stx-balance.query';
import { t } from '@lingui/macro';

import { PressableProps, StxAvatarIcon } from '@leather.io/ui/native';

import {
  EmptyBalance,
  TokenBalance,
  type TokenBalance as TokenBalanceType,
} from '../token-balance';

interface StacksTokenBalanceProps extends PressableProps {
  availableBalance: TokenBalanceType;
  fiatBalance: TokenBalanceType;
  isLoading?: boolean;
}
export function StacksTokenBalance({
  availableBalance,
  fiatBalance,
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
      isLoading={isLoading}
      {...rest}
    />
  );
}

interface StacksBalanceProps {
  onPress?(): void;
}

export function StacksBalance({ onPress }: StacksBalanceProps) {
  const balance = useStxTotalBalance();

  const availableBalance =
    balance.state === 'success' ? balance.value.stx.availableBalance : EmptyBalance;
  const fiatBalance =
    balance.state === 'success' ? balance.value.fiat.availableBalance : EmptyBalance;

  return (
    <StacksTokenBalance
      availableBalance={availableBalance}
      fiatBalance={fiatBalance}
      onPress={onPress}
      isLoading={balance.state === 'loading'}
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
  const balance = useStxAccountBalance(fingerprint, accountIndex);

  const availableBalance =
    balance.state === 'success' ? balance.value.stx.availableBalance : EmptyBalance;
  const fiatBalance =
    balance.state === 'success' ? balance.value.fiat.availableBalance : EmptyBalance;

  return (
    <StacksTokenBalance
      availableBalance={availableBalance}
      fiatBalance={fiatBalance}
      onPress={onPress}
      isLoading={balance.state === 'loading'}
    />
  );
}
