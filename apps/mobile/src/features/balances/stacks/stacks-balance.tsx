import { useStxAccountBalance, useStxTotalBalance } from '@/queries/balance/stx-balance.query';
import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';
import { PressableProps, StxAvatarIcon } from '@leather.io/ui/native';

import { TokenBalance } from '../token-balance';

interface StacksTokenBalanceProps extends PressableProps {
  availableBalance: Money;
  fiatBalance: Money;
}
export function StacksTokenBalance({ availableBalance, fiatBalance }: StacksTokenBalanceProps) {
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
    />
  );
}

export function StacksBalance() {
  const balance = useStxTotalBalance();
  // TODO LEA-1726: handle balance loading & error states
  if (balance.state !== 'success') return;
  return (
    <StacksTokenBalance
      availableBalance={balance.value.stx.availableBalance}
      fiatBalance={balance.value.fiat.availableBalance}
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
  // TODO LEA-1726: handle balance loading & error states
  if (balance.state !== 'success') return;
  return (
    <StacksTokenBalance
      availableBalance={balance.value.stx.availableBalance}
      fiatBalance={balance.value.fiat.availableBalance}
      onPress={onPress}
    />
  );
}
