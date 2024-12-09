import { ElementRef, forwardRef } from 'react';
import { type GestureResponderEvent, Pressable as RNPressable } from 'react-native';

import { isString } from '@leather.io/utils';

import { useHaptics } from '../../hooks/use-haptics.native';
import { PressableCore, PressableCoreProps, PressableRestyleProps } from './pressable-core.native';

type PressableHapticFeedbackType = 'soft' | 'light' | 'medium' | 'heavy' | 'rigid';

interface HapticConfig {
  onPress?: PressableHapticFeedbackType;
  onLongPress?: PressableHapticFeedbackType;
}

type PressableElement = ElementRef<typeof RNPressable>;
interface PressableOwnProps {
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
  pressTransitions?: {
    [K in keyof PressableRestyleProps]: {
      from: PressableRestyleProps[K];
      to: PressableRestyleProps[K];
    };
  };
}

export type PressableProps = PressableOwnProps & PressableCoreProps;

export const Pressable = forwardRef<PressableElement, PressableProps>(
  ({ haptics = {}, onPress, onLongPress, pressTransitions, ...rest }, ref) => {
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

    return (
      <PressableCore ref={ref} onPress={handlePress} onLongPress={handleLongPress} {...rest} />
    );
  }
);
