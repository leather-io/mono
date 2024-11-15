import { Pressable as RNPressable, type PressableProps as RNPressableProps } from 'react-native';
import Animated, { type AnimatedProps } from 'react-native-reanimated';

import {
  BackgroundColorShorthandProps,
  BorderProps,
  LayoutProps,
  OpacityProps,
  PositionProps,
  SpacingShorthandProps,
  VisibleProps,
  backgroundColorShorthand,
  border,
  createRestyleComponent,
  layout,
  opacity,
  position,
  spacingShorthand,
  visible,
} from '@shopify/restyle';

import { Theme } from '../../theme-native';

export type PressableBaseProps = RNPressableProps &
  OpacityProps<Theme> &
  VisibleProps<Theme> &
  SpacingShorthandProps<Theme> &
  BorderProps<Theme> &
  BackgroundColorShorthandProps<Theme> &
  LayoutProps<Theme> &
  PositionProps<Theme>;

export const buttonRestyleFunctions = [
  opacity,
  visible,
  spacingShorthand,
  border,
  backgroundColorShorthand,
  layout,
  position,
];

const PressableBase = createRestyleComponent<PressableBaseProps, Theme>(
  buttonRestyleFunctions,
  RNPressable
);

export const Pressable = Animated.createAnimatedComponent(PressableBase);
export interface PressableProps extends AnimatedProps<PressableBaseProps> {
  // Incorrect typings in: https://github.com/software-mansion/react-native-reanimated/blob/main/packages/react-native-reanimated/src/helperTypes.ts#L48
  // resulting in inferred key prop of createAnimatedComponent(X) to be incompatible with itself.
  // TODO: Needs further investigation/raising an issue.
  key?: any;
}
