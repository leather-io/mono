import { ResponsiveValue, useTheme } from '@shopify/restyle';

import { Box, ChevronRightIcon, IconProps, Text, Theme, TouchableOpacity } from '../../../native';

type CellVariant = 'active' | 'inactive' | 'critical';

function getIconColor(
  variant: CellVariant
): ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']> {
  switch (variant) {
    case 'active':
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
      return 'ink.background-secondary';
    case 'inactive':
      return 'ink.background-secondary';
    case 'critical':
      return 'red.background-primary';
  }
}

interface CellProps {
  title: string;
  subtitle?: string;
  onPress?(): unknown;
  Icon: React.FC<IconProps>;
  variant?: CellVariant;
}

export function Cell({ title, subtitle, onPress, Icon, variant = 'active' }: CellProps) {
  const theme = useTheme<Theme>();
  const isDisabled = !onPress;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box flexDirection="row" gap="4">
        <Box flexDirection="row" p="2" bg={getIconBackgroundColor(variant)} borderRadius="round">
          <Icon color={theme.colors[getIconColor(variant)]} />
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
      <ChevronRightIcon color={theme.colors['ink.text-primary']} variant="small" />
    </TouchableOpacity>
  );
}
