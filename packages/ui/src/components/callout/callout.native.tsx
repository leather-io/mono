import { ReactNode } from 'react';

import { ResponsiveValue } from '@shopify/restyle';

import { CheckmarkCircleIcon } from '../../icons/checkmark-circle-icon.native';
import { ErrorTriangleIcon } from '../../icons/error-triangle-icon.native';
import { InfoCircleIcon } from '../../icons/info-circle-icon.native';
import { Theme } from '../../theme-native';
import { Box, type BoxProps } from '../box/box.native';
import { Text } from '../text/text.native';

type CalloutVariant = 'default' | 'info' | 'warning' | 'error' | 'success';

interface VariantStyle {
  bg: ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>;
}

const calloutVariants: Record<CalloutVariant, VariantStyle> = {
  default: {
    bg: 'ink.text-non-interactive',
  },
  error: {
    bg: 'red.background-secondary',
  },
  info: {
    bg: 'blue.background-secondary',
  },
  success: {
    bg: 'green.background-secondary',
  },
  warning: {
    bg: 'yellow.background-secondary',
  },
};

const icons = {
  info: <InfoCircleIcon />,
  success: <CheckmarkCircleIcon />,
  warning: <ErrorTriangleIcon />,
  error: <ErrorTriangleIcon />,
  default: null,
};

export interface CalloutProps extends BoxProps {
  /** Title of the callout.  */
  title?: string;
  /** Contents of the callout */
  children?: ReactNode;
  /** Specify a custom icon to override the default for the variant. */
  icon?: ReactNode;
  variant?: CalloutVariant;
}

export function Callout({ title, children, icon, variant = 'default' }: CalloutProps) {
  const variantStyle = calloutVariants[variant];

  return (
    <Box flexDirection="row" justifyContent="space-between" gap="3" py="4" px="5" {...variantStyle}>
      <Box gap="1" justifyContent="center" flexShrink={1}>
        {title && <Text variant="label02">{title}</Text>}
        {children && <Text variant="caption01">{children}</Text>}
      </Box>
      <Box aria-hidden flexShrink={0}>
        {icon ?? icons[variant]}
      </Box>
    </Box>
  );
}
