import { ReactNode } from 'react';

import { Balance } from '@/components/balance/balance';
import { Loading } from '@/components/loading/loading';
import { TestId } from '@/shared/test-id';

import { Money } from '@leather.io/models';
import { Cell, type PressableProps, Text } from '@leather.io/ui/native';

interface TokenBalanceProps extends PressableProps {
  ticker: string;
  icon: ReactNode;
  tokenName: string;
  availableBalance?: Money;
  fiatBalance?: Money;
  isLoading?: boolean;
}
export function TokenBalance({
  icon,
  tokenName,
  availableBalance,
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
          <Text variant="caption01" lineHeight={16}>
            {rest.ticker}
          </Text>
        </Cell.Label>
      </Cell.Content>
      <Cell.Aside>
        <Cell.Label variant="primary">
          <Balance balance={fiatBalance} variant="label02" lineHeight={16} />
        </Cell.Label>
        <Cell.Label variant="secondary">
          <Balance balance={availableBalance} variant="caption01" />
        </Cell.Label>
      </Cell.Aside>
    </Cell.Root>
  );
}
