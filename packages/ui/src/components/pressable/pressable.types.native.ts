import { type Animated } from 'react-native';
import { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

import {
  type AtLeastOneResponsiveValue,
  type BackgroundColorShorthandProps,
  type SpacingShorthandProps,
} from '@shopify/restyle';

import { type Theme } from '../../theme-native';
import { type PressableRestyleProps } from './pressable-core.native';

type OmitNonAnimatableProps<Props> = Omit<
  Props,
  | 'visible'
  | 'flex'
  | 'flexDirection'
  | 'flexGrow'
  | 'flexShrink'
  | 'flexWrap'
  | 'flexBasis'
  | 'alignItems'
  | 'alignContent'
  | 'alignSelf'
  | 'justifyContent'
  | 'overflow'
  | keyof SpacingShorthandProps<Theme>
  | keyof BackgroundColorShorthandProps<Theme>
>;

type ExtractNonResponsiveValue<T> = T extends AtLeastOneResponsiveValue<infer V, any> ? V : T;

type ExcludeDisallowedPropValues<V> = Exclude<
  V,
  boolean | undefined | null | Animated.AnimatedNode
>;

type ExcludesDisallowedValues<V> = ExcludeDisallowedPropValues<ExtractNonResponsiveValue<V>>;

interface AnimationSettingsSpring {
  type: 'spring';
  delay?: number;
  config?: WithSpringConfig;
}

interface AnimationSettingsTiming {
  type: 'timing';
  delay?: number;
  config?: WithTimingConfig;
}

export type AnimationSettings = AnimationSettingsSpring | AnimationSettingsTiming;

type RestylePropsToPressEffects<Props> = {
  [K in keyof OmitNonAnimatableProps<Props>]: {
    from: ExcludesDisallowedValues<Props[K]>;
    to: ExcludesDisallowedValues<Props[K]>;
    settings?:
      | AnimationSettings
      // Ensure TS correctly reports absense of 'type' when only 'config' is specified.
      | { type?: never; config?: never };
  };
};

export type PressEffects = RestylePropsToPressEffects<PressableRestyleProps>;
