import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export function useAppState({
  onAppForeground,
  onAppBackground,
}: {
  onAppForeground?: () => void;
  onAppBackground?: () => void;
}) {
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current === 'background' && nextAppState === 'active') {
        onAppForeground?.();
      }
      if (appState.current === 'inactive' && nextAppState === 'background') {
        onAppBackground?.();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [onAppForeground, onAppBackground]);
}
