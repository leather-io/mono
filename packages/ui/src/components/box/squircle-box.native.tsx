import { ComponentType } from 'react';
import { ViewStyle } from 'react-native';

import {
  BackgroundColorProps,
  BackgroundColorShorthandProps,
  BaseTheme,
  LayoutProps,
  OpacityProps,
  PositionProps,
  ResponsiveValue,
  RestyleFunctionContainer,
  ShadowProps,
  SpacingProps,
  SpacingShorthandProps,
  VisibleProps,
  backgroundColor,
  backgroundColorShorthand,
  createRestyleComponent,
  createRestyleFunction,
  layout,
  opacity,
  position,
  shadow,
  spacing,
  spacingShorthand,
  visible,
} from '@shopify/restyle';
import { SquircleView, SquircleViewProps } from 'expo-squircle-view';

import { Theme } from '../../theme-native';

// Custom fork of `createBox` to leave out the `borderRadius` prop.
// Restyle doesn't support arbitrary style values, necessary for tweaking squircle borderRadius.

function getKeys<T extends { [key: string]: any }>(object: T) {
  return Object.keys(object) as (keyof T)[];
}

const borderProperties = {
  borderBottomWidth: true,
  borderLeftWidth: true,
  borderRightWidth: true,
  borderStyle: true,
  borderTopWidth: true,
  borderStartWidth: true,
  borderEndWidth: true,
  borderWidth: true,
};

const borderColorProperties = {
  borderColor: true,
  borderTopColor: true,
  borderRightColor: true,
  borderLeftColor: true,
  borderBottomColor: true,
  borderStartColor: true,
  borderEndColor: true,
};

type BorderProps<Theme extends BaseTheme> = {
  [Key in keyof typeof borderProperties]?: ResponsiveValue<ViewStyle[Key], Theme['breakpoints']>;
} & {
  [Key in keyof typeof borderColorProperties]?: ResponsiveValue<
    keyof Theme['colors'],
    Theme['breakpoints']
  >;
};

export const border = [
  ...getKeys(borderProperties).map(property => {
    return createRestyleFunction({
      property,
    });
  }),
  ...getKeys(borderColorProperties).map(property => {
    return createRestyleFunction({
      property,
      themeKey: 'colors',
    });
  }),
];

type BoxProps = BackgroundColorProps<Theme> &
  OpacityProps<Theme> &
  VisibleProps<Theme> &
  LayoutProps<Theme> &
  SpacingProps<Theme> &
  BorderProps<Theme> &
  ShadowProps<Theme> &
  PositionProps<Theme> &
  SpacingShorthandProps<Theme> &
  BackgroundColorShorthandProps<Theme>;

export const boxRestyleFunctions = [
  backgroundColor,
  backgroundColorShorthand,
  opacity,
  visible,
  layout,
  spacing,
  spacingShorthand,
  border,
  shadow,
  position,
];

export type SquircleBoxProps = BoxProps & SquircleViewProps;

export const SquircleBox: ComponentType<BoxProps & SquircleViewProps> = createRestyleComponent<
  BoxProps & SquircleViewProps,
  Theme
>(boxRestyleFunctions as RestyleFunctionContainer<BoxProps, Theme>[], SquircleView);
