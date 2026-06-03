import { ResponsiveValue } from '@shopify/restyle';

import { Theme } from '../../theme-native';
import { Box, BoxProps } from '../box/box.native';
import { Text } from '../text/text.native';

type BadgeVariant = 'default' | 'info' | 'success' | 'warning' | 'error';
type BadgeSize = 'sm' | 'md';

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

const badgeSizes: Record<BadgeSize, number> = {
  sm: 22,
  md: 24,
};

export interface BadgeProps extends BoxProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  outlined?: boolean;
}

export function Badge({ variant = 'default', size = 'sm', outlined, ...props }: BadgeProps) {
  const styles = badgeVariants[variant];

  return (
    <Box
      alignItems="center"
      justifyContent="center"
      bg={outlined ? undefined : styles.bg}
      borderColor={styles.borderColor}
      borderRadius="round"
      borderWidth={1}
      height={badgeSizes[size]}
      px="2"
      {...props}
    >
      <Text variant="label03" color={styles.color}>
        {props.label}
      </Text>
    </Box>
  );
}
