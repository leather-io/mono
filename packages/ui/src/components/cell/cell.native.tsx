import { Switch } from 'react-native';

import { ResponsiveValue, useTheme } from '@shopify/restyle';

import { Box, ChevronRightIcon, IconProps, Text, Theme, TouchableOpacity } from '../../../native';

type RegularCellVariant = 'active' | 'inactive' | 'critical';
type SwitchCellVariant = 'switch';
type CellVariant = RegularCellVariant | SwitchCellVariant;

function getIconColor(
  variant: CellVariant
): ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']> {
  switch (variant) {
    case 'active':
    case 'switch':
      return 'ink.text-primary';
    case 'inactive':
      return 'ink.text-subdued';
    case 'critical':
      return 'red.action-primary-default';
  }
}

function getIconBackgroundColor(
  variant: CellVariant
): ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']> {
  switch (variant) {
    case 'active':
    case 'switch':
      return 'ink.background-secondary';
    case 'inactive':
      return 'ink.background-secondary';
    case 'critical':
      return 'red.background-primary';
  }
}

interface SwitchCell {
  variant: SwitchCellVariant;
  switchValue: boolean;
  toggleSwitchValue(): void;
}

interface RegularCell {
  variant?: RegularCellVariant;
}

interface BaseCell {
  title: string;
  subtitle?: string;
  onPress?(): unknown;
  Icon: React.FC<IconProps>;
}

type CellProps = BaseCell & (RegularCell | SwitchCell);

export function Cell({ title, subtitle, onPress, Icon, ...props }: CellProps) {
  const theme = useTheme<Theme>();
  const isDisabled = !onPress;
  const _variant = props.variant ?? 'active';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box flexDirection="row" gap="4">
        <Box flexDirection="row" p="2" bg={getIconBackgroundColor(_variant)} borderRadius="round">
          <Icon color={theme.colors[getIconColor(_variant)]} />
        </Box>
        <Box flexDirection="column" justifyContent="center">
          <Text variant="label02">{title}</Text>
          {subtitle && (
            <Text color="ink.text-subdued" variant="label03">
              {subtitle}
            </Text>
          )}
        </Box>
      </Box>
      {props.variant === 'switch' && (
        <Switch
          trackColor={{
            false: theme.colors['ink.background-secondary'],
            true: theme.colors['ink.text-primary'],
          }}
          thumbColor={
            props.switchValue
              ? theme.colors['ink.background-primary']
              : theme.colors['ink.background-primary']
          }
          ios_backgroundColor={theme.colors['ink.background-secondary']}
          onValueChange={props.toggleSwitchValue}
          value={props.switchValue}
        />
      )}
      {props.variant !== 'switch' && (
        <ChevronRightIcon color={theme.colors['ink.text-primary']} variant="small" />
      )}
    </TouchableOpacity>
  );
}
