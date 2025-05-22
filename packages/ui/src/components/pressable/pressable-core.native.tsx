import { RefObject } from 'react';
import { Pressable as RNPressable, type PressableProps as RNPressableProps } from 'react-native';
import Animated, { AnimatedProps } from 'react-native-reanimated';

import {
  type BackgroundColorProps,
  type BackgroundColorShorthandProps,
  type BorderProps,
  type LayoutProps,
  type OpacityProps,
  type PositionProps,
  ShadowProps,
  type SpacingProps,
  type SpacingShorthandProps,
  type VisibleProps,
  backgroundColorShorthand,
  border,
  createRestyleComponent,
  layout,
  opacity,
  position,
  shadow,
  spacing,
  spacingShorthand,
  visible,
} from '@shopify/restyle';

import { Theme } from '../../theme-native';

export type PressableRestyleProps = OpacityProps<Theme> &
  VisibleProps<Theme> &
  SpacingShorthandProps<Theme> &
  SpacingProps<Theme> &
  ShadowProps<Theme> &
  BorderProps<Theme> &
  BackgroundColorProps<Theme> &
  BackgroundColorShorthandProps<Theme> &
  LayoutProps<Theme> &
  PositionProps<Theme>;

export const AnimatedRestylePressable = Animated.createAnimatedComponent(
  createRestyleComponent<PressableRestyleProps & RNPressableProps, Theme>(
    [
      backgroundColorShorthand,
      border,
      layout,
      opacity,
      position,
      spacing,
      shadow,
      spacingShorthand,
      visible,
    ],
    RNPressable
  )
);

export type PressableRef = RefObject<typeof RNPressable>;

// react-native-reanimated incorrectly blanket-wraps input component props with their internal SharedValue
// without filtering out non-animatable props like event handlers, the `key` prop, causing problems at usage points:
// https://github.com/software-mansion/react-native-reanimated/blob/3f864e6ae89d0edbbeedda17809c4ef9ea927622/packages/react-native-reanimated/src/helperTypes.ts#L48
// Work around this by defining a narrower signature of props we actually need for Pressable, and exporting a custom
// wrapper around the component created from Animated HOC to ensure TS correctly resolves to our custom types.
export type PressableCoreProps = RNPressableProps &
  PressableRestyleProps &
  Pick<
    AnimatedProps<RNPressableProps & PressableRestyleProps>,
    'animatedProps' | 'style' | 'sharedTransitionStyle' | 'sharedTransitionTag'
  >;

export function PressableCore(props: PressableCoreProps & { ref?: PressableRef }) {
  return <AnimatedRestylePressable {...props} />;
}

PressableCore.displayName = 'PressableCore';
