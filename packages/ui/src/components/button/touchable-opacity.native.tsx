import { ComponentPropsWithoutRef } from 'react';
import { TouchableOpacity as RNTouchableOpacity } from 'react-native';

import {
  BackgroundColorProps,
  BackgroundColorShorthandProps,
  BaseTheme,
  BorderProps,
  LayoutProps,
  OpacityProps,
  ResponsiveValue,
  SpacingProps,
  SpacingShorthandProps,
  TextShadowProps,
  TypographyProps,
  VariantProps,
  VisibleProps,
  backgroundColor,
  backgroundColorShorthand,
  border,
  createRestyleComponent,
  createVariant,
  layout,
  opacity,
  spacing,
  spacingShorthand,
  textShadow,
  typography,
  visible,
} from '@shopify/restyle';

import { Theme } from '../../theme-native';

export interface TextColorProps<Theme extends BaseTheme> {
  textColor?: ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>;
  textDecorationColor?: ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>;
}

type BaseButtonProps<Theme extends BaseTheme> = VariantProps<Theme, 'textVariants', 'textVariant'> &
  OpacityProps<Theme> &
  VisibleProps<Theme> &
  TypographyProps<Theme> &
  SpacingProps<Theme> &
  SpacingShorthandProps<Theme> &
  BorderProps<Theme> &
  BackgroundColorProps<Theme> &
  BackgroundColorShorthandProps<Theme> &
  LayoutProps<Theme> &
  TextColorProps<Theme> &
  TextShadowProps<Theme> &
  ComponentPropsWithoutRef<typeof RNTouchableOpacity>;

export const buttonRestyleFunctions = [
  opacity,
  visible,
  typography,
  spacing,
  spacingShorthand,
  textShadow,
  border,
  backgroundColor,
  backgroundColorShorthand,
  layout,
  createVariant({ themeKey: 'textVariants', property: 'textVariant' }),
];

export const TouchableOpacity = createRestyleComponent<BaseButtonProps<Theme>, Theme>(
  buttonRestyleFunctions,
  RNTouchableOpacity
);
