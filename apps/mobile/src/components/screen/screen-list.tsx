import Animated, { FlatListPropsWithLayout } from 'react-native-reanimated';

import { useSafeBottomInset } from '@/components/screen/use-safe-bottom-inset';

export function ScreenList<T>(props: FlatListPropsWithLayout<T>) {
  const bottomInset = useSafeBottomInset();

  return <Animated.FlatList contentContainerStyle={{ paddingBottom: bottomInset }} {...props} />;
}
