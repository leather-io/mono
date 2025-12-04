import { type GestureResponderEvent } from 'react-native';

import { isDefined, isString } from '@leather.io/utils';

import { useHaptics } from '../../hooks/use-haptics.native';
import { usePressedState } from '../../hooks/use-pressed-state.native';
import { PressableCore, PressableCoreProps, PressableRef } from './pressable-core.native';

type PressableHapticFeedbackType = 'soft' | 'light' | 'medium' | 'heavy' | 'rigid';

interface HapticConfig {
  onPress?: PressableHapticFeedbackType;
  onLongPress?: PressableHapticFeedbackType;
}

interface PressableOwnProps {
  ref?: PressableRef;
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

export type PressableProps = PressableOwnProps & PressableCoreProps;

export function Pressable({
  haptics = {},
  onPress,
  onLongPress,
  style,
  ref,
  ...rest
}: PressableProps) {
  const triggerHaptics = useHaptics();
  const hapticConfig = isString(haptics) ? { onPress: haptics } : haptics;
  const { onPressIn, onPressOut, pressed } = usePressedState(rest);
  const shouldPassLongPress = isDefined(onLongPress) || isDefined(hapticConfig.onLongPress);

  function handlePress(event: GestureResponderEvent) {
    if (hapticConfig.onPress) {
      void triggerHaptics(hapticConfig.onPress);
    }
    onPress?.(event);
  }

  function handleLongPress(event: GestureResponderEvent) {
    if (hapticConfig.onLongPress) {
      void triggerHaptics(hapticConfig.onLongPress);
    }
    onLongPress?.(event);
  }

  return (
    <PressableCore
      ref={ref}
      onPress={handlePress}
      onLongPress={shouldPassLongPress ? handleLongPress : undefined}
      style={[
        {
          transitionProperty: 'opacity',
          transitionDuration: 200,
          opacity: pressed ? 0.5 : 1,
        },
        style,
      ]}
      {...rest}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    />
  );
}

Pressable.displayName = 'Pressable';
