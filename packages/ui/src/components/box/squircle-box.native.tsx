import { type ViewStyle } from 'react-native';

import {
  type BackgroundColorProps,
  type BackgroundColorShorthandProps,
  type BaseTheme,
  type LayoutProps,
  type OpacityProps,
  type PositionProps,
  type ResponsiveValue,
  type ShadowProps,
  type SpacingProps,
  type SpacingShorthandProps,
  type VisibleProps,
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
import { SquircleView, type SquircleViewProps } from 'expo-squircle-view';
import { keys } from 'remeda';

import { type Theme } from '../../theme-native';

// Custom fork of `createBox` to leave out the `borderRadius` prop.
// Restyle doesn't support arbitrary style values, necessary for tweaking squircle borderRadius.

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

const border = [
  ...keys(borderProperties).map(property => {
    return createRestyleFunction({
      property,
    });
  }),
  ...keys(borderColorProperties).map(property => {
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

const boxRestyleFunctions = [
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

export const SquircleBox = createRestyleComponent<BoxProps & SquircleViewProps, Theme>(
  boxRestyleFunctions,
  SquircleView
);
