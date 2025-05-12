import { ReactNode } from 'react';

import { Balance } from '@/components/balance/balance';
import { Loading } from '@/components/loading/loading';
import { getChainLayerFromAssetProtocol } from '@/features/balances/utils/get-chain-layer-from-protocol';
import { TestId } from '@/shared/test-id';

import { CryptoAssetProtocol, Money } from '@leather.io/models';
import { Cell, type PressableProps, Text } from '@leather.io/ui/native';

export const EmptyBalance = '-.--';
export type TokenBalance = Money | typeof EmptyBalance;

interface TokenBalanceProps extends PressableProps {
  ticker: string;
  icon: ReactNode;
  tokenName: string;
  availableBalance: TokenBalance;
  protocol: CryptoAssetProtocol;
  fiatBalance: TokenBalance;
  isLoading?: boolean;
}
export function TokenBalance({
  icon,
  tokenName,
  availableBalance,
  protocol,
  fiatBalance,
  onPress,
  isLoading,
  ...rest
}: TokenBalanceProps) {
  if (isLoading) return <Loading />;

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
        <Cell.Label variant="secondary">
          <Text variant="caption01" color="ink.text-subdued" lineHeight={16}>
            {getChainLayerFromAssetProtocol(protocol)}
          </Text>
        </Cell.Label>
      </Cell.Content>
      <Cell.Aside>
        <Cell.Label variant="primary">
          <Balance balance={availableBalance} variant="label02" />
        </Cell.Label>
        <Cell.Label variant="secondary">
          <Balance
            balance={fiatBalance}
            variant="caption01"
            color="ink.text-subdued"
            lineHeight={16}
          />
        </Cell.Label>
      </Cell.Aside>
    </Cell.Root>
  );
}
