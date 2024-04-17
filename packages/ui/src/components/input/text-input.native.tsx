import { ComponentPropsWithoutRef } from 'react';
import { TextInput as RNTextInput } from 'react-native';

import {
  BackgroundColorProps,
  BackgroundColorShorthandProps,
  BaseTheme,
  BorderProps,
  ColorProps,
  LayoutProps,
  OpacityProps,
  SpacingProps,
  SpacingShorthandProps,
  TextShadowProps,
  TypographyProps,
  VariantProps,
  VisibleProps,
  backgroundColor,
  backgroundColorShorthand,
  border,
  color,
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

type BaseButtonProps<Theme extends BaseTheme> = ComponentPropsWithoutRef<typeof RNTextInput> &
  VariantProps<Theme, 'textVariants', 'textVariant'> &
  OpacityProps<Theme> &
  VisibleProps<Theme> &
  TypographyProps<Theme> &
  SpacingProps<Theme> &
  SpacingShorthandProps<Theme> &
  BorderProps<Theme> &
  BackgroundColorProps<Theme> &
  BackgroundColorShorthandProps<Theme> &
  LayoutProps<Theme> &
  ColorProps<Theme> &
  TextShadowProps<Theme>;

export const textInputRestyleFunctions = [
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
  color,
  createVariant({ themeKey: 'textVariants', property: 'textVariant' }),
];

export const TextInput = createRestyleComponent<BaseButtonProps<Theme>, Theme>(
  textInputRestyleFunctions,
  RNTextInput
);
