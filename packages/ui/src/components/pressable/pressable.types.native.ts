import { ViewStyle } from 'react-native';
import {
  CSSTransitionDelay,
  CSSTransitionDuration,
  CSSTransitionTimingFunction,
} from 'react-native-reanimated';

import { type Theme } from '../../theme-native';

export const pressEffectProperties = [
  'opacity',
  'transform',
  'backgroundColor',
  'borderColor',
] as const;

export interface PressEffectConfig<T> {
  to: T;
  from: T;
  duration?: CSSTransitionDuration;
  timing?: CSSTransitionTimingFunction;
  delay?: CSSTransitionDelay;
}

export interface PressEffect {
  opacity?: PressEffectConfig<number>;
  transform?: PressEffectConfig<NonNullable<ViewStyle['transform']>>;
  backgroundColor?: PressEffectConfig<keyof Theme['colors']>;
  borderColor?: PressEffectConfig<keyof Theme['colors']>;
}

export interface ResolvedPressEffect {
  opacity?: PressEffectConfig<number>;
  transform?: PressEffectConfig<NonNullable<ViewStyle['transform']>>;
  backgroundColor?: PressEffectConfig<string>;
  borderColor?: PressEffectConfig<string>;
}
