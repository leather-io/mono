import { type GestureResponderEvent } from 'react-native';

import { isDefined, isString } from '@leather.io/utils';

import { useHaptics } from '../../hooks/use-haptics.native';
import { usePressedState } from '../../hooks/use-pressed-state.native';
import { PressableCore, PressableCoreProps, PressableRef } from './pressable-core.native';
import { PressEffects } from './pressable.types.native';
import { usePressEffectStyle } from './pressable.utils.native';

type PressableHapticFeedbackType = 'soft' | 'light' | 'medium' | 'heavy' | 'rigid';

interface HapticConfig {
  onPress?: PressableHapticFeedbackType;
  onLongPress?: PressableHapticFeedbackType;
}

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
  /**
   * Specify animations for pressed state
   *
   * @example
   * // Basic property transition
   * <Pressable pressEffects={{ opacity: { from: 1, to: 0.5 } }} />
   *
   * @example
   * // Multiple properties
   * <Pressable
   *   pressEffects={{
   *     opacity: { from: 1, to: 0.5 },
   *     backgroundColor: { from: 'ink.background-primary', to: 'ink.background-secondary' },
   *   }}
   * />
   *
   * @example
   * // Delay the transition
   * <Pressable pressEffects={{ opacity: { from: 1, to: 0.5 }, settings: { delay: 150 } }} />
   *
   * @example
   * // Specify react-native-reanimated configuration
   * <Pressable pressEffects={{ opacity: { from: 1, to: 0.5, settings: { type: 'spring', config: { duration: 300 } } } }} />
   */
  pressEffects?: PressEffects;
}

export type PressableProps = PressableOwnProps & PressableCoreProps;

export function Pressable({
  haptics = {},
  pressEffects = {},
  onPress,
  onLongPress,
  style,
  ref,
  ...rest
}: PressableProps & { ref?: PressableRef }) {
  const triggerHaptics = useHaptics();
  const hapticConfig = isString(haptics) ? { onPress: haptics } : haptics;
  const { onPressIn, onPressOut, pressed } = usePressedState(rest);
  const pressEffectStyle = usePressEffectStyle({ pressed, pressEffects });
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
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[pressEffectStyle, style]}
      {...rest}
    />
  );
}

Pressable.displayName = 'Pressable';

/**
 * https://linear.app/leather-io/issue/LEA-1859
 * Press effect preset to mimic react-native Touchable transition.
 * This preset is up for removal. It's only used for components that previously used Touchable, and require a new design for the pressed state.
 * */
export const legacyTouchablePressEffect = {
  opacity: {
    from: 1,
    to: 0.5,
    settings: {
      type: 'spring',
      config: {
        duration: 200,
      },
    },
  },
} as const;
