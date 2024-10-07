import { ComponentPropsWithoutRef } from 'react';
import { Pressable as RNPressable } from 'react-native';

import {
  BackgroundColorProps,
  BackgroundColorShorthandProps,
  BaseTheme,
  BorderProps,
  LayoutProps,
  OpacityProps,
  PositionProps,
  ResponsiveValue,
  RestyleFunctionContainer,
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
  position,
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

export type PressableProps<Theme extends BaseTheme> = VariantProps<
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
  ComponentPropsWithoutRef<typeof RNPressable>;

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
  position,
  createVariant({ themeKey: 'textVariants', property: 'textVariant' }),
];

export const Pressable = createRestyleComponent<PressableProps<Theme>, Theme>(
  buttonRestyleFunctions as RestyleFunctionContainer<PressableProps<Theme>, Theme>[],
  RNPressable
);
