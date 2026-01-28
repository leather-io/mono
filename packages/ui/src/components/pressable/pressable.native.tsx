import { type GestureResponderEvent } from 'react-native';

import { isDefined, isString } from '@leather.io/utils';

import { useHaptics } from '../../hooks/use-haptics.native';
import { usePressedState } from '../../hooks/use-pressed-state.native';
import { useTheme } from '../../hooks/use-theme.native';
import { type Theme } from '../../theme-native';
import { PressableCore, PressableCoreProps, PressableRef } from './pressable-core.native';
import { buildPressEffectStyles } from './pressable.build-press-effect-styles.native';
import { PressEffect, ResolvedPressEffect } from './pressable.types.native';

type PressableHapticFeedbackType = 'soft' | 'light' | 'medium' | 'heavy' | 'rigid';

interface HapticConfig {
  onPress?: PressableHapticFeedbackType;
  onLongPress?: PressableHapticFeedbackType;
}

const defaultPressEffect: PressEffect = { opacity: { from: 1, to: 0.5, duration: 150 } };

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
  /**
   * Specify animations for pressed state
   *
   * @example
   * // Basic property transition
   * <Pressable pressEffect={{ opacity: { from: 1, to: 0.5 } }} />
   *
   * @example
   * // Multiple properties
   * <Pressable
   *   pressEffect={{
   *     opacity: { from: 1, to: 0.5 },
   *     backgroundColor: { from: 'ink.background-primary', to: 'ink.background-secondary' },
   *   }}
   * />
   *
   * @example
   * // Custom transition timing
   * <Pressable
   *   pressEffect={{
   *     opacity: { from: 1, to: 0.7, duration: 200, timing: 'ease-out' },
   *     transform: { from: [{ scale: 1 }], to: [{ scale: 0.95 }], delay: 50 },
   *   }}
   * />
   */
  pressEffect?: PressEffect | null;
}

export type PressableProps = PressableOwnProps & PressableCoreProps;

export function Pressable({
  onPress,
  onLongPress,
  haptics = {},
  pressEffect = defaultPressEffect,
  style,
  ref,
  ...rest
}: PressableProps) {
  const { colors } = useTheme();
  const triggerHaptics = useHaptics();
  const hapticConfig = isString(haptics) ? { onPress: haptics } : haptics;
  const { onPressIn, onPressOut, pressed } = usePressedState(rest);
  const shouldPassLongPress = isDefined(onLongPress) || isDefined(hapticConfig.onLongPress);
  const resolvedPressEffect = resolvePressEffectColors(pressEffect, colors);
  const effectivePressedStyle = buildPressEffectStyles(resolvedPressEffect, pressed);

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
      style={[effectivePressedStyle, style]}
      {...rest}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    />
  );
}

Pressable.displayName = 'Pressable';

const colorEffectProperties = ['backgroundColor', 'borderColor'] as const;

function resolvePressEffectColors(
  pressEffect: PressEffect | null,
  colors: Theme['colors']
): ResolvedPressEffect | null {
  if (!pressEffect) return null;

  const resolved = { ...pressEffect } as ResolvedPressEffect;

  for (const property of colorEffectProperties) {
    const config = pressEffect[property];
    if (!config) continue;

    resolved[property] = {
      ...config,
      from: colors[config.from],
      to: colors[config.to],
    };
  }

  return resolved;
}
