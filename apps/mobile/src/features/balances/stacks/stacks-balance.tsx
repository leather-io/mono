import { TokenIcon } from '@/components/widgets/tokens/token-icon';
import { useStxAccountBalance, useStxTotalBalance } from '@/queries/balance/stx-balance.query';
import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';
import { PressableProps } from '@leather.io/ui/native';

import { TokenBalance } from '../token-balance';

interface StacksTokenBalanceProps extends PressableProps {
  availableBalance: Money;
  fiatBalance: Money;
}
export function StacksTokenBalance({
  availableBalance,
  fiatBalance,
  ...rest
}: StacksTokenBalanceProps) {
  return (
    <TokenBalance
      ticker="STX"
      icon={<TokenIcon ticker="STX" />}
      tokenName={t({
        id: 'asset_name.stacks',
        message: 'Stacks',
      })}
      protocol="nativeStx"
      fiatBalance={fiatBalance}
      availableBalance={availableBalance}
      {...rest}
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
      px="5"
      py="3"
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
      px="5"
      py="3"
    />
  );
}
