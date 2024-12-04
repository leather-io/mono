import { ElementRef, forwardRef } from 'react';
import {
  type GestureResponderEvent,
  Pressable as RNPressable,
  type PressableProps as RNPressableProps,
} from 'react-native';
import Animated, { type AnimatedProps } from 'react-native-reanimated';

import {
  BackgroundColorShorthandProps,
  BorderProps,
  LayoutProps,
  OpacityProps,
  PositionProps,
  SpacingProps,
  SpacingShorthandProps,
  VisibleProps,
  backgroundColorShorthand,
  border,
  composeRestyleFunctions,
  layout,
  opacity,
  position,
  spacing,
  spacingShorthand,
  useRestyle,
  visible,
} from '@shopify/restyle';

import { isString } from '@leather.io/utils';

import { useHaptics } from '../../hooks/use-haptics.native';
import { Theme } from '../../theme-native';

type PressableHapticFeedbackType = 'soft' | 'light' | 'medium' | 'heavy' | 'rigid';

interface HapticConfig {
  onPress?: PressableHapticFeedbackType;
  onLongPress?: PressableHapticFeedbackType;
}

type RestyleProps = OpacityProps<Theme> &
  VisibleProps<Theme> &
  SpacingShorthandProps<Theme> &
  SpacingProps<Theme> &
  BorderProps<Theme> &
  BackgroundColorShorthandProps<Theme> &
  LayoutProps<Theme> &
  PositionProps<Theme>;

type PressableElement = ElementRef<typeof RNPressable>;

interface PressableBaseProps extends RNPressableProps, RestyleProps {
  /**
   * Configure haptic feedback
   *
   * @example
   * // Provide a single string value to apply feedback to `onPress`.
   * <Pressable haptics="soft" />
   *
   * // Use an object to specify feedback type for press, long press, or both
   * <Pressable haptics={{ onPress: 'light', onLongPress: 'rigid' }} />
   */
  haptics?: PressableHapticFeedbackType | HapticConfig;
}

export const buttonRestyleFunctions = composeRestyleFunctions<Theme, RestyleProps>([
  opacity,
  visible,
  spacingShorthand,
  spacing,
  border,
  backgroundColorShorthand,
  layout,
  position,
]);

const PressableBase = forwardRef<PressableElement, PressableBaseProps>(
  ({ onPress, onLongPress, haptics = {}, ...rest }, ref) => {
    const props = useRestyle(buttonRestyleFunctions, rest);
    const triggerHaptics = useHaptics();
    const hapticConfig = isString(haptics) ? { onPress: haptics } : haptics;

    function handlePress(event: GestureResponderEvent) {
      if (hapticConfig.onPress) {
        triggerHaptics(hapticConfig.onPress);
      }
      onPress?.(event);
    }

    function handleLongPress(event: GestureResponderEvent) {
      if (hapticConfig.onLongPress) {
        triggerHaptics(hapticConfig.onLongPress);
      }
      onLongPress?.(event);
    }

    return <RNPressable ref={ref} onPress={handlePress} onLongPress={handleLongPress} {...props} />;
  }
);

export const Pressable = Animated.createAnimatedComponent(PressableBase);
export type PressableProps = AnimatedProps<PressableBaseProps>;
