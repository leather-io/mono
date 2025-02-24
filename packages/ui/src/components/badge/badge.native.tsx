import { ResponsiveValue } from '@shopify/restyle';

import { Theme } from '../../theme-native';
import { Box, BoxProps } from '../box/box.native';
import { Text } from '../text/text.native';

export type BadgeVariant = 'default' | 'info' | 'success' | 'warning' | 'error';

interface VariantProps {
  bg: ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>;
  borderColor: ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>;
  color: ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>;
}

const badgeVariants: Record<BadgeVariant, VariantProps> = {
  default: {
    bg: 'ink.background-secondary',
    borderColor: 'ink.border-transparent',
    color: 'ink.text-subdued',
  },
  info: {
    bg: 'blue.background-primary',
    borderColor: 'blue.border',
    color: 'blue.action-primary-default',
  },
  success: {
    bg: 'green.background-primary',
    borderColor: 'green.border',
    color: 'green.action-primary-default',
  },
  warning: {
    bg: 'yellow.background-primary',
    borderColor: 'yellow.border',
    color: 'yellow.action-primary-default',
  },
  error: {
    bg: 'red.background-primary',
    borderColor: 'red.border',
    color: 'red.action-primary-default',
  },
};

export interface BadgeProps extends BoxProps {
  label: string;
  variant?: BadgeVariant;
  outlined?: boolean;
}

export function Badge({ variant = 'default', outlined, ...props }: BadgeProps) {
  const styles = badgeVariants[variant];

  return (
    <Box
      bg={outlined ? undefined : styles.bg}
      borderColor={styles.borderColor}
      borderRadius="xs"
      borderWidth={1}
      height={24}
      p="1"
      {...props}
    >
      <Text variant="label03" color={styles.color}>
        {props.label}
      </Text>
    </Box>
  );
}
