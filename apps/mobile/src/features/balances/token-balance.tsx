import { ReactNode } from 'react';

import { Balance } from '@/components/balance/balance';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';

import { CryptoAssetProtocol, Money } from '@leather.io/models';
import { Cell, type PressableProps } from '@leather.io/ui/native';

export function getChainLayerFromAssetProtocol(protocol: CryptoAssetProtocol) {
  switch (protocol) {
    case 'nativeBtc':
    case 'nativeStx':
      return t({ id: 'account_balance.caption_left.native', message: 'Layer 1' });
    case 'sip10':
      return t({ id: 'account_balance.caption_left.sip10', message: 'Layer 2 · Stacks' });
    default:
      return '';
  }
}

interface TokenBalanceProps extends PressableProps {
  ticker: string;
  icon: ReactNode;
  tokenName: string;
  availableBalance?: Money;
  protocol: CryptoAssetProtocol;
  fiatBalance: Money;
}
export function TokenBalance({
  icon,
  tokenName,
  availableBalance,
  protocol,
  fiatBalance,
  onPress,
  ...rest
}: TokenBalanceProps) {
  return (
    <Cell.Root
      pressable={true}
      testID={`${TestId.tokenBalanceItem}-${rest.ticker}`}
      disabled={!onPress}
      onPress={onPress}
      {...rest}
    >
      <Cell.Icon>{icon}</Cell.Icon>
      <Cell.Content>
        <Cell.Label variant="primary">{tokenName}</Cell.Label>
        <Cell.Label variant="secondary">{getChainLayerFromAssetProtocol(protocol)}</Cell.Label>
      </Cell.Content>
      <Cell.Aside>
        <Cell.Label variant="primary">
          {availableBalance && <Balance balance={availableBalance} variant="label02" />}
        </Cell.Label>
        <Cell.Label variant="secondary">
          {<Balance balance={fiatBalance} variant="label02" color="ink.text-subdued" />}
        </Cell.Label>
      </Cell.Aside>
    </Cell.Root>
  );
}
