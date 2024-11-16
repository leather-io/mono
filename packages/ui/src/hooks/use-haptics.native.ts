import {
  ImpactFeedbackStyle,
  NotificationFeedbackType,
  impactAsync,
  notificationAsync,
  selectionAsync,
} from 'expo-haptics';

import { assertUnreachable } from '@leather.io/utils';

export type HapticFeedbackType =
  | 'soft'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'rigid'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error';

export function useHaptics() {
  return function triggerHaptics(hapticFeedbackType: HapticFeedbackType) {
    try {
      switch (hapticFeedbackType) {
        case 'soft':
          return impactAsync(ImpactFeedbackStyle.Soft);
        case 'light':
          return impactAsync(ImpactFeedbackStyle.Light);
        case 'medium':
          return impactAsync(ImpactFeedbackStyle.Medium);
        case 'heavy':
          return impactAsync(ImpactFeedbackStyle.Heavy);
        case 'rigid':
          return impactAsync(ImpactFeedbackStyle.Rigid);
        case 'selection':
          return selectionAsync();
        case 'success':
          return notificationAsync(NotificationFeedbackType.Success);
        case 'warning':
          return notificationAsync(NotificationFeedbackType.Warning);
        case 'error':
          return notificationAsync(NotificationFeedbackType.Error);
        default:
          return assertUnreachable(hapticFeedbackType);
      }
    } catch {
      return;
    }
  };
}
