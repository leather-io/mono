import { ComponentPropsWithoutRef, forwardRef } from 'react';
import { TouchableOpacity as RNTouchableOpacity } from 'react-native';
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

import { Text, Theme, TouchableOpacity } from '@leather.io/ui/native';

const buttonRestyleFunctions = [opacity, visible, spacing, spacingShorthand, layout];

type BaseButtonProps<Theme extends BaseTheme> = OpacityProps<Theme> &
  VisibleProps<Theme> &
  SpacingProps<Theme> &
  SpacingShorthandProps<Theme> &
  LayoutProps<Theme>;

type Props = BaseButtonProps<Theme> & ComponentPropsWithoutRef<typeof RNTouchableOpacity>;
const composedRestyleFunction = composeRestyleFunctions<Theme, Props>(buttonRestyleFunctions);

export type ButtonState = 'default' | 'disabled' | 'success' | 'outline' | 'ghost';

function whenButtonState<T>(buttonState: ButtonState, match: Record<ButtonState, T>) {
  switch (buttonState) {
    case 'default':
      return match.default;
    case 'disabled':
      return match.disabled;
    case 'success':
      return match.success;
    case 'outline':
      return match.outline;
    case 'ghost':
      return match.ghost;
  }
}

export function getTextColor(buttonState: ButtonState) {
  return whenButtonState<ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>>(
    buttonState,
    {
      default: 'ink.background-primary',
      disabled: 'ink.text-non-interactive',
      success: 'green.action-primary-default',
      outline: 'ink.action-primary-default',
      ghost: 'ink.text-primary',
    }
  );
}

// TODO: Move to UI library
export const Button = forwardRef(
  (
    {
      title,
      buttonState,
      icon,
      ...rest
    }: Props & {
      title?: string;
      buttonState: ButtonState;
      icon?: React.ReactNode;
    },
    ref
  ) => {
    const props = useRestyle(composedRestyleFunction, rest);

    const bg = whenButtonState<
      ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']> | undefined
    >(buttonState, {
      default: 'ink.text-primary',
      disabled: 'ink.background-secondary',
      success: 'green.background-primary',
      outline: 'ink.background-primary',
      ghost: undefined,
    });

    const textColor = getTextColor(buttonState);

    const borderColor = whenButtonState<
      ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']> | undefined
    >(buttonState, {
      default: undefined,
      disabled: undefined,
      success: undefined,
      outline: 'ink.action-primary-default',
      ghost: undefined,
    });

    const borderWidth = whenButtonState<number | undefined>(buttonState, {
      default: undefined,
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
        p="3"
        borderRadius="xs"
        justifyContent="center"
        alignItems="center"
        borderColor={borderColor}
        borderWidth={borderWidth}
        flexDirection="row"
        gap={hasGap ? '2' : undefined}
        {...props}
      >
        {icon}
        <Text variant={textVariant} color={textColor}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }
);

export const AnimatedButton = Animated.createAnimatedComponent(Button);
