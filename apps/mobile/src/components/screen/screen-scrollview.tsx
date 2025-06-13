import Animated, { AnimatedScrollViewProps } from 'react-native-reanimated';

import { useSafeBottomInset } from '@/components/screen/use-safe-bottom-inset';

export function ScreenScrollView(props: AnimatedScrollViewProps) {
  const bottomInset = useSafeBottomInset();
  return <Animated.ScrollView contentInset={{ bottom: bottomInset }} {...props} />;
}
