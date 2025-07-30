import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import { useAnimatedStyle } from 'react-native-reanimated';

import { useTabLayoutContext } from '@/features/navigation/tab-layout-context';

export function useSearchBarAnimatedStyles() {
  const { height: keyboardHeight, progress } = useReanimatedKeyboardAnimation();
  const { tabBarHeight } = useTabLayoutContext();

  const keyboardAvoidingStyle = useAnimatedStyle(() => ({
    bottom: -keyboardHeight.value - tabBarHeight - 1,
  }));
  const searchBarStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: progress.value >= 0.5 ? [{ translateY: 0 }] : [{ translateY: 200 }],
    };
  });
  return { searchBarStyle, keyboardAvoidingStyle };
}
