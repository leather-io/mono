import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import { useAnimatedStyle } from 'react-native-reanimated';

export function useSearchBarAnimatedStyles() {
  const { height: keyboardHeight, progress } = useReanimatedKeyboardAnimation();

  const keyboardAvoidingStyle = useAnimatedStyle(() => ({
    bottom: -keyboardHeight.value - 100,
  }));
  const searchBarStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: progress.value >= 0.5 ? [{ translateY: 0 }] : [{ translateY: 200 }],
    };
  });
  return { searchBarStyle, keyboardAvoidingStyle };
}
