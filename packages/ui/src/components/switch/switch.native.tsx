import { Switch as RNSwitch, SwitchProps as RNSwitchProps } from 'react-native';

import { useTheme } from '@shopify/restyle';
import { Theme } from 'from ../../../native';

export interface SwitchProps extends RNSwitchProps {
  value: boolean;
}
export function Switch({ value, onValueChange, ...props }: SwitchProps) {
  const theme = useTheme<Theme>();

  return (
    <RNSwitch
      ios_backgroundColor={theme.colors['ink.background-secondary']}
      onValueChange={onValueChange}
      thumbColor={
        value ? theme.colors['ink.background-primary'] : theme.colors['ink.background-primary']
      }
      trackColor={{
        false: theme.colors['ink.background-secondary'],
        true: theme.colors['ink.text-primary'],
      }}
      value={value}
      {...props}
    />
  );
}
