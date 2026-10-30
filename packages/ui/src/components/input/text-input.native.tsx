import { type ComponentPropsWithRef, type ComponentType } from 'react';
import { TextInput as RNTextInput } from 'react-native';

import {
  type BackgroundColorProps,
  type BackgroundColorShorthandProps,
  type BaseTheme,
  type BorderProps,
  type ColorProps,
  type LayoutProps,
  type OpacityProps,
  type SpacingProps,
  type SpacingShorthandProps,
  type TextShadowProps,
  type TypographyProps,
  type VariantProps,
  type VisibleProps,
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

import { type Theme } from '../../theme-native';

export type TextInputProps<Theme extends BaseTheme> = ComponentPropsWithRef<typeof RNTextInput> &
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

const textInputRestyleFunctions = [
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

export function createTextInput(TextInputComponent: ComponentType) {
  return createRestyleComponent<TextInputProps<Theme>, Theme>(
    textInputRestyleFunctions,
    TextInputComponent
  );
}

export const TextInput = createTextInput(RNTextInput);
