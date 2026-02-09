import { ReactNode } from 'react';

import { Loading } from '@/components/loading/loading';
import { TestId } from '@/shared/test-id';

import { Cell, type PressableProps, Text } from '@leather.io/ui/native';

export interface TokenCellProps extends PressableProps {
  ticker: string;
  icon: ReactNode;
  tokenName: string;
  isLoading?: boolean;
  asideComponent: ReactNode;
}
export function TokenCell({
  icon,
  tokenName,
  onPress,
  isLoading,
  asideComponent,
  ...rest
}: TokenCellProps) {
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
        <Cell.Label variant="primary" numberOfLines={1} ellipsizeMode="tail">
          {tokenName}
        </Cell.Label>
        <Cell.Label variant="secondary">
          <Text variant="caption01" lineHeight={16}>
            {rest.ticker}
          </Text>
        </Cell.Label>
      </Cell.Content>
      {asideComponent}
    </Cell.Root>
  );
}
