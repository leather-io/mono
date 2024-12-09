import { ReactNode, createContext, useContext } from 'react';

import {
  ImpactFeedbackStyle,
  NotificationFeedbackType,
  impactAsync,
  notificationAsync,
  selectionAsync,
} from 'expo-haptics';

import { assertUnreachable } from '@leather.io/utils';

interface HapticsContextValue {
  enabled: boolean;
}

const HapticsContext = createContext<HapticsContextValue>({ enabled: true });

interface HapticsProviderProps {
  enabled: boolean;
  children: ReactNode;
}

export function HapticsProvider({ children, enabled }: HapticsProviderProps) {
  return <HapticsContext.Provider value={{ enabled }}>{children}</HapticsContext.Provider>;
}

function useHapticsContext(): HapticsContextValue {
  return useContext(HapticsContext);
}

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
  const { enabled } = useHapticsContext();

  return function triggerHaptics(hapticFeedbackType: HapticFeedbackType) {
    if (!enabled) {
      return;
    }

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
    } catch {}
  };
}
