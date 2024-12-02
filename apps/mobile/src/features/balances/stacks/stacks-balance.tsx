import { TokenIcon } from '@/components/widgets/tokens/token-icon';
import { useStxBalance } from '@/queries/balance/stacks-balance.query';
import {
  useStacksSignerAddressFromAccountIndex,
  useStacksSignerAddresses,
} from '@/store/keychains/stacks/stacks-keychains.read';

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
      // tokenName={t({
      //   id: 'asset_name.stacks',
      //   message: 'Stacks',
      // })}
      // FIXME: LEA-1780 Re-enable this when Crowdin issues solved
      // eslint-disable-next-line no-console, lingui/no-unlocalized-strings
      tokenName="Stacks"
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
  if (!address) {
    throw new Error('Stacks address not found');
  }
  const { availableBalance, fiatBalance } = useStxBalance([address]);
  return (
    <StacksTokenBalance
      availableBalance={availableBalance}
      fiatBalance={fiatBalance}
      onPress={onPress}
    />
  );
}
