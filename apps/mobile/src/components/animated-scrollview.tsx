import Animated, { useAnimatedScrollHandler } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HasChildren } from '@/utils/types';
import { useTheme } from '@shopify/restyle';

import { Theme } from '@leather.io/ui/native';

interface AnimatedScrollViewProps extends HasChildren {
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>;
}
export function AnimatedScrollView({ children, scrollHandler }: AnimatedScrollViewProps) {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();

  return (
    <Animated.ScrollView
      contentContainerStyle={{
        gap: theme.spacing[5],
        paddingBottom: theme.spacing['5'] + bottom,
        paddingHorizontal: theme.spacing['5'],
        paddingTop: theme.spacing['5'],
      }}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    >
      {children}
    </Animated.ScrollView>
  );
}
