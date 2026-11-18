import { type ComponentPropsWithoutRef } from 'react';
import { TouchableOpacity as RNTouchableOpacity } from 'react-native';

import {
  type BackgroundColorProps,
  type BackgroundColorShorthandProps,
  type BaseTheme,
  type BorderProps,
  type LayoutProps,
  type OpacityProps,
  type PositionProps,
  type ResponsiveValue,
  type SpacingProps,
  type SpacingShorthandProps,
  type TextShadowProps,
  type TypographyProps,
  type VariantProps,
  type VisibleProps,
  backgroundColor,
  backgroundColorShorthand,
  border,
  createRestyleComponent,
  createVariant,
  layout,
  opacity,
  position,
  spacing,
  spacingShorthand,
  textShadow,
  typography,
  visible,
} from '@shopify/restyle';

import { type Theme } from '../../theme-native';

interface TextColorProps<Theme extends BaseTheme> {
  textColor?: ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>;
  textDecorationColor?: ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>;
}

type TouchableOpacityProps<Theme extends BaseTheme> = VariantProps<
  Theme,
  'textVariants',
  'textVariant'
> &
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
  PositionProps<Theme> &
  ComponentPropsWithoutRef<typeof RNTouchableOpacity>;

const buttonRestyleFunctions = [
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
  position,
  createVariant({ themeKey: 'textVariants', property: 'textVariant' }),
];

export const TouchableOpacity = createRestyleComponent<TouchableOpacityProps<Theme>, Theme>(
  buttonRestyleFunctions,
  RNTouchableOpacity
);
