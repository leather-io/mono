import { useEffect } from 'react';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { BrowserType } from '../utils';

export function useSearchBarAnimatedStyles({ browserType }: { browserType: BrowserType }) {
  const { height: keyboardHeight, progress } = useReanimatedKeyboardAnimation();
  const isUrlFocused = useSharedValue(false);
  const browserTypeSharedValue = useSharedValue<BrowserType>(browserType);
  useEffect(() => {
    browserTypeSharedValue.value = browserType;
  }, [browserType, browserTypeSharedValue]);

  const keyboardAvoidingStyle = useAnimatedStyle(() => ({
    bottom: isUrlFocused.value ? -keyboardHeight.value : 0,
  }));
  const browserNavigationBarStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 1], [1, 0], Extrapolation.CLAMP),
      zIndex: interpolate(progress.value, [0, 1], [100, -5], Extrapolation.CLAMP),
    };
  });
  const searchBarStyle = useAnimatedStyle(() => {
    if (browserTypeSharedValue.value === 'inactive') {
      return { opacity: 1, zIndex: 0 };
    }
    return {
      // no need to interpolate as progress.value is a continuous value between 0 and 1
      opacity: progress.value,
      zIndex: interpolate(progress.value, [0, 1], [-5, 100], Extrapolation.CLAMP),
    };
  });
  return { searchBarStyle, browserNavigationBarStyle, keyboardAvoidingStyle, isUrlFocused };
}
