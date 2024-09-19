import { Switch as RNSwitch, SwitchProps as RNSwitchProps } from 'react-native';

import { useTheme } from '@shopify/restyle';
import { Theme } from 'from ../../../native';

interface SwitchProps extends RNSwitchProps {
  onToggleValue?(): void;
  value: boolean;
}
export function Switch({ onToggleValue, value, ...props }: SwitchProps) {
  const theme = useTheme<Theme>();

  return (
    <RNSwitch
      ios_backgroundColor={theme.colors['ink.background-secondary']}
      onValueChange={onToggleValue}
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
