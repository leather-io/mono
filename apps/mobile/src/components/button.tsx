import { ComponentPropsWithoutRef, FC, forwardRef } from 'react';
import { TouchableOpacity as RNTouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { SvgProps } from 'react-native-svg';

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
  useTheme,
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
      Icon?: FC<SvgProps>;
    },
    ref
  ) => {
    const props = useRestyle(composedRestyleFunction, rest);
    const theme = useTheme<Theme>();
    const bg = whenButtonState<
      ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']> | undefined
    >(buttonState, {
      default: 'base.ink.text-primary',
      disabled: 'base.ink.background-secondary',
      success: 'base.green.background-primary',
      outline: 'base.ink.background-primary',
      ghost: undefined,
    });

    const textColor = whenButtonState<ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>>(
      buttonState,
      {
        default: 'base.ink.background-primary',
        disabled: 'base.ink.text-non-interactive',
        success: 'base.green.action-primary-default',
        outline: 'base.ink.action-primary-default',
        ghost: 'base.ink.text-primary',
      }
    );

    const borderColor = whenButtonState<
      ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']> | undefined
    >(buttonState, {
      default: undefined,
      disabled: undefined,
      success: undefined,
      outline: 'base.ink.action-primary-default',
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
        {Icon && <Icon height={24} width={24} color={theme.colors[textColor]} />}
        <Text variant={textVariant} color={textColor}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }
);

export const AnimatedButton = Animated.createAnimatedComponent(Button);
