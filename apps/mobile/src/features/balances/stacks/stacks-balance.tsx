import { TokenIcon } from '@/components/widgets/tokens/token-icon';
import { useStxBalance } from '@/queries/balance/stacks-balance.query';
import {
  useStacksSignerAddressFromAccountIndex,
  useStacksSignerAddresses,
} from '@/store/keychains/stacks/stacks-keychains.read';
import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';

import { TokenBalance } from '../token-balance';

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
      tokenName={t({
        id: 'asset_name.stacks',
        message: 'Stacks',
      })}
      protocol="nativeStx"
      fiatBalance={fiatBalance}
      availableBalance={availableBalance}
      onPress={onPress}
    />
  );
}

export function StacksBalance() {
  const addresses = useStacksSignerAddresses();
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
  const address = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex);
  // TODO use loader pattern here https://github.com/leather-io/mono/pull/640#discussion_r1851957125
  if (!address) {
    throw new Error('Stacks address not found');
  }
  const { availableBalance, fiatBalance } = useStxBalance([address]);
  console.log('StacksBalanceByAccount', fingerprint, accountIndex, availableBalance, fiatBalance);
  return (
    <StacksTokenBalance
      availableBalance={availableBalance}
      fiatBalance={fiatBalance}
      onPress={onPress}
    />
  );
}
