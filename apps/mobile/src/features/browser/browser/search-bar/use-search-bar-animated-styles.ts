import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export function useSearchBarAnimatedStyles(): {
  searchBarStyle: { opacity: number; zIndex: number };
  browserNavigationBarStyle: { opacity: number; zIndex: number };
  keyboardAvoidingStyle: { bottom: number };
  isUrlFocused: SharedValue<boolean>;
} {
  const { height: keyboardHeight, progress } = useReanimatedKeyboardAnimation();
  const isUrlFocused = useSharedValue(false);
  const keyboardAvoidingStyle = useAnimatedStyle(() => ({
    bottom: isUrlFocused.value ? -keyboardHeight.value : 0,
  }));
  const browserNavigationBarStyle = useAnimatedStyle(() => {
    if (isUrlFocused.value) {
      return {
        opacity: interpolate(progress.value, [0, 1], [1, 0], Extrapolation.CLAMP),
        zIndex: interpolate(progress.value, [0, 1], [100, -5], Extrapolation.CLAMP),
      };
    }
    return {
      opacity: 1,
      zIndex: 100,
    };
  });
  const searchBarStyle = useAnimatedStyle(() => {
    if (isUrlFocused.value) {
      return {
        // no need to interpolate as progress.value is a continuous value between 0 and 1
        opacity: progress.value,
        zIndex: interpolate(progress.value, [0, 1], [-5, 100], Extrapolation.CLAMP),
      };
    }
    return {
      opacity: 0,
      zIndex: -5,
    };
  });
  return { searchBarStyle, browserNavigationBarStyle, keyboardAvoidingStyle, isUrlFocused };
}
