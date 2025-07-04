import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export function useSearchBarAnimatedStyles() {
  const { height: keyboardHeight, progress } = useReanimatedKeyboardAnimation();
  const isUrlFocused = useSharedValue(false);
  const keyboardAvoidingStyle = useAnimatedStyle(() => ({
    bottom: isUrlFocused.value ? -keyboardHeight.value : 0,
  }));

  const browserNavigationBarStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 1], [1, 0], Extrapolation.CLAMP),
      transform: progress.value >= 0.5 ? [{ translateY: 200 }] : [{ translateY: 0 }],
      zIndex: 100,
    };
  });
  const searchBarStyle = useAnimatedStyle(() => {
    return {
      // no need to interpolate as progress.value is a continuous value between 0 and 1
      opacity: progress.value,
      transform: progress.value >= 0.5 ? [{ translateY: 0 }] : [{ translateY: 200 }],
      zIndex: 100,
    };
  });
  return { searchBarStyle, browserNavigationBarStyle, keyboardAvoidingStyle, isUrlFocused };
}
