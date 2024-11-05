import { TokenIcon } from '@/components/widgets/tokens/token-icon';
import { useStxBalance } from '@/queries/balance/stacks-balance.query';
import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';

import { TokenBalance } from '../token-balance';
import { useGetStacksAddresses } from './use-get-stacks-addresses';

interface StacksTokenBalanceProps {
  availableBalance: Money;
  fiatBalance: Money;
  onPress?(): void;
}
export function StacksTokenBalance({
  availableBalance,
  fiatBalance,
  onPress,
}: StacksTokenBalanceProps) {
  return (
    <TokenBalance
      ticker="STX"
      icon={<TokenIcon ticker="STX" />}
      tokenName={t`Stacks`}
      chain={t`Layer 1`}
      fiatBalance={fiatBalance}
      availableBalance={availableBalance}
      onPress={onPress}
    />
  );
}

export function StacksBalance() {
  const addresses = useGetStacksAddresses();
  const { availableBalance, fiatBalance } = useStxBalance(addresses);
  return <StacksTokenBalance availableBalance={availableBalance} fiatBalance={fiatBalance} />;
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
  const addresses = useGetStacksAddresses({ accountIndex, fingerprint });
  const { availableBalance, fiatBalance } = useStxBalance(addresses);
  return (
    <StacksTokenBalance
      availableBalance={availableBalance}
      fiatBalance={fiatBalance}
      onPress={onPress}
    />
  );
}
