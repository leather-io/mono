import { ComponentProps, ComponentType } from 'react';
import { type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';

import { type BoxProps as RestyleBoxProps, createBox } from '@shopify/restyle';

import { type Theme } from '../../theme-native';

export const Box: ReturnType<typeof createBox<Theme>> = createBox<Theme>();
export const AnimatedBox: ReturnType<
  typeof Animated.createAnimatedComponent<ComponentType<RestyleBoxProps<Theme> & ViewProps>>
> = Animated.createAnimatedComponent(Box);
export type BoxProps = ViewProps & RestyleBoxProps<Theme>;
export type AnimatedBoxProps = ComponentProps<typeof AnimatedBox>;
