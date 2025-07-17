import { ComponentPropsWithoutRef, RefObject } from 'react';
import { TouchableOpacity as RNTouchableOpacity, StyleProp, TextStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  BaseTheme,
  LayoutProps,
  OpacityProps,
  ResponsiveValue,
  SpacingProps,
  SpacingShorthandProps,
  VariantProps,
  VisibleProps,
  composeRestyleFunctions,
  layout,
  opacity,
  spacing,
  spacingShorthand,
  useRestyle,
  visible,
} from '@shopify/restyle';

import { match } from '@leather.io/utils';

import { Text, Theme, TouchableOpacity } from '../../../native';

const buttonRestyleFunctions = [opacity, visible, spacing, spacingShorthand, layout];

type BaseButtonProps<Theme extends BaseTheme> = OpacityProps<Theme> &
  VisibleProps<Theme> &
  SpacingProps<Theme> &
  SpacingShorthandProps<Theme> &
  LayoutProps<Theme>;

type Props = BaseButtonProps<Theme> & ComponentPropsWithoutRef<typeof RNTouchableOpacity>;
const composedRestyleFunction = composeRestyleFunctions<Theme, Props>(buttonRestyleFunctions);

export type ButtonState = 'default' | 'critical' | 'disabled' | 'success' | 'outline' | 'ghost';

type ButtonSize = 'xs' | 'sm' | 'md';

export function ButtonV2({
  title,
  buttonState: buttonStateProp = 'default',
  icon,
  textStyle,
  size = 'md',
  ref,
  ...rest
}: Props & {
  title?: string;
  buttonState?: ButtonState;
  icon?: React.ReactNode;
  textStyle?: StyleProp<TextStyle>;
  size?: ButtonSize;
  ref?: RefObject<typeof TouchableOpacity | null>;
}) {
  const matchButtonSize = match<ButtonSize>();
  const buttonHeight = matchButtonSize<number>(size, {
    xs: 32,
    sm: 40,
    md: 48,
  });
  const buttonPx = matchButtonSize<ResponsiveValue<keyof Theme['spacing'], Theme['breakpoints']>>(
    size,
    {
      xs: '3',
      sm: '3',
      md: '4',
    }
  );
  const buttonPy = matchButtonSize<ResponsiveValue<keyof Theme['spacing'], Theme['breakpoints']>>(
    size,
    {
      xs: '2',
      sm: '2',
      md: '3',
    }
  );

  const props = useRestyle(composedRestyleFunction, rest);
  const buttonState = rest.disabled ? 'disabled' : buttonStateProp;
  const matchButtonState = match<ButtonState>();

  const textColor = matchButtonState<ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>>(
    buttonState,
    {
      default: 'ink.background-primary',
      critical: 'ink.background-primary',
      disabled: 'ink.text-non-interactive',
      success: 'ink.background-primary',
      outline: 'ink.action-primary-default',
      ghost: 'ink.text-primary',
    }
  );

  const bg = matchButtonState<
    ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']> | undefined
  >(buttonState, {
    default: 'ink.text-primary',
    critical: 'red.action-primary-default',
    disabled: 'ink.background-secondary',
    success: 'green.action-primary-default',
    outline: 'ink.background-primary',
    ghost: undefined,
  });

  const borderColor = matchButtonState<
    ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']> | undefined
  >(buttonState, {
    default: undefined,
    critical: undefined,
    disabled: undefined,
    success: undefined,
    outline: 'ink.border-default',
    ghost: undefined,
  });

  const borderWidth = matchButtonState<number | undefined>(buttonState, {
    default: undefined,
    critical: undefined,
    disabled: undefined,
    success: undefined,
    outline: 1,
    ghost: undefined,
  });

  const textVariant: VariantProps<Theme, 'textVariants'>['variant'] = 'label02';

  const hasGap = !!icon && !!title;

  return (
    <TouchableOpacity
      ref={ref}
      bg={bg}
      px={buttonPx}
      py={buttonPy}
      height={buttonHeight}
      borderRadius="round"
      justifyContent="center"
      alignItems="center"
      borderColor={borderColor}
      borderWidth={borderWidth}
      flexDirection="row"
      gap={hasGap ? '2' : undefined}
      {...props}
    >
      {icon}
      <Text variant={textVariant} color={textColor} style={textStyle}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

ButtonV2.displayName = 'Button';

export const AnimatedButtonV2 = Animated.createAnimatedComponent(ButtonV2);
