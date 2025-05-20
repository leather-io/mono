import { ComponentPropsWithRef, ComponentType } from 'react';
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

export function createTextInput<T extends ComponentType>(TextInputComponent: T) {
  return createRestyleComponent<TextInputProps<Theme>, Theme>(
    textInputRestyleFunctions,
    TextInputComponent
  );
}

export const TextInput = createTextInput(RNTextInput);
