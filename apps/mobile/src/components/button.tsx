import { ComponentPropsWithoutRef, ReactNode, forwardRef } from 'react';
import { TouchableOpacity as RNTouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';

import { Text, Theme, TouchableOpacity } from '@leather-wallet/ui/native';
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

const buttonRestyleFunctions = [opacity, visible, spacing, spacingShorthand, layout];

type BaseButtonProps<Theme extends BaseTheme> = OpacityProps<Theme> &
  VisibleProps<Theme> &
  SpacingProps<Theme> &
  SpacingShorthandProps<Theme> &
  LayoutProps<Theme>;

type Props = BaseButtonProps<Theme> & ComponentPropsWithoutRef<typeof RNTouchableOpacity>;
const composedRestyleFunction = composeRestyleFunctions<Theme, Props>(buttonRestyleFunctions);

export type ButtonState = 'default' | 'disabled' | 'success' | 'outline';

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
  }
}

export const Button = forwardRef(
  (
    {
      title,
      buttonState,
      Icon,
      ...rest
    }: Props & {
      title?: string;
      buttonState: ButtonState;
      Icon?: ReactNode;
    },
    ref
  ) => {
    const props = useRestyle(composedRestyleFunction, rest);

    const bg = whenButtonState<ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>>(
      buttonState,
      {
        default: 'base.ink.text-primary',
        disabled: 'base.ink.background-secondary',
        success: 'base.green.background-primary',
        outline: 'base.ink.background-primary',
      }
    );

    const textColor = whenButtonState<ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>>(
      buttonState,
      {
        default: 'base.ink.background-primary',
        disabled: 'base.ink.text-non-interactive',
        success: 'base.green.action-primary-default',
        outline: 'base.ink.action-primary-default',
      }
    );

    const borderColor = whenButtonState<
      ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']> | undefined
    >(buttonState, {
      default: undefined,
      disabled: undefined,
      success: undefined,
      outline: 'base.ink.action-primary-default',
    });

    const borderWidth = whenButtonState<number | undefined>(buttonState, {
      default: undefined,
      disabled: undefined,
      success: undefined,
      outline: 1,
    });

    const textVariant: VariantProps<Theme, 'textVariants'>['variant'] = 'label02';

    const hasGap = !!Icon && !!title;

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
        {Icon}
        <Text variant={textVariant} color={textColor}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }
);

export const AnimatedButton = Animated.createAnimatedComponent(Button);
