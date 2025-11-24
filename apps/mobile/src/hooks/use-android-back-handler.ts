import { useEffect } from 'react';
import { BackHandler } from 'react-native';

export function useAndroidBackHandler(handler: () => void) {
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handler();
      return true;
    });
    return () => subscription.remove();
  }, [handler]);
}
