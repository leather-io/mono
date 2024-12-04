import { ResponsiveValue } from '@shopify/restyle';

import { match } from '@leather.io/utils';

import { Theme } from '../../theme-native';
import { Box } from '../box/box.native';
import { Pressable, PressableProps } from '../pressable/pressable.native';
import { Text } from '../text/text.native';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'default' | 'info';

interface BadgeProps extends PressableProps {
  title: string;
  variant: BadgeVariant;
}

export function Badge(props: BadgeProps) {
  const matchBadgeVariant = match<BadgeVariant>();

  const backgroundColor = matchBadgeVariant<
    ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>
  >(props.variant, {
    success: 'green.background-primary',
    warning: 'yellow.background-primary',
    error: 'red.background-primary',
    default: 'ink.background-secondary',
    info: 'blue.background-primary',
  });

  const borderColor = matchBadgeVariant<
    ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>
  >(props.variant, {
    success: 'green.border',
    warning: 'yellow.border',
    error: 'red.border',
    default: 'ink.border-transparent',
    info: 'blue.border',
  });

  const textColor = matchBadgeVariant<ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>>(
    props.variant,
    {
      success: 'green.action-primary-default',
      warning: 'yellow.action-primary-default',
      error: 'red.action-primary-default',
      default: 'ink.text-subdued',
      info: 'blue.action-primary-default',
    }
  );

  return (
    <Pressable {...props}>
      <Box bg={backgroundColor} borderColor={borderColor} borderRadius="xs" borderWidth={1} p="1">
        <Text variant="label03" color={textColor}>
          {props.title}
        </Text>
      </Box>
    </Pressable>
  );
}
