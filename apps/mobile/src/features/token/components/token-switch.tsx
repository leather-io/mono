import { ReactNode, useState } from 'react';

import { TestId } from '@/shared/test-id';

import { Cell, type PressableProps, Switch, Text } from '@leather.io/ui/native';

export interface TokenSwitchProps extends PressableProps {
  ticker: string;
  icon: ReactNode;
  tokenName: string;
  value: boolean;
  onValueChange(val: boolean): void;
}
export function TokenSwitch({ icon, tokenName, value, onValueChange, ...rest }: TokenSwitchProps) {
  const [switchValue, setSwitchValue] = useState(value);
  function updateValue(val: boolean) {
    // We need to optimistically set Switch value to a new position, otherwise Switch value bounces back
    // to the old position if it takes too long to update the value prop. (redux doesn't work here)
    setSwitchValue(val);
    onValueChange(val);
  }
  return (
    <Cell.Root
      pressable
      testID={`${TestId.tokenSwitchItem}-${rest.ticker}`}
      onPress={() => {
        updateValue(!switchValue);
      }}
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
      <Cell.Aside>
        <Switch value={switchValue} onValueChange={updateValue} />
      </Cell.Aside>
    </Cell.Root>
  );
}
