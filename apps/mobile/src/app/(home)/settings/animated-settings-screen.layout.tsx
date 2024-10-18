import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedTitleHeader } from '@/components/headers/animated-title-header';
import { NetworkBadge } from '@/components/network-badge';
import { HasChildren } from '@/utils/types';

import { Box, Text } from '@leather.io/ui/native';

interface AnimatedSettingsScreenLayoutProps extends HasChildren {
  containerStyles?: Record<string, string | number>;
  title: string;
}
export function AnimatedSettingsScreenLayout({
  children,
  containerStyles,
  title,
}: AnimatedSettingsScreenLayoutProps) {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const opacity = scrollY.value >= 68 ? withTiming(1) : withTiming(0);
    const translationX = withTiming(scrollY.value >= 68 ? 0 : 50, { duration: 300 });
    return {
      opacity,
      transform: [{ translateX: translationX }],
    };
  });

  return (
    <>
      <AnimatedTitleHeader
        animatedStyle={animatedHeaderStyle}
        rightElement={<NetworkBadge />}
        title={title}
      />
      <Box backgroundColor="ink.background-primary" flex={1}>
        <Animated.ScrollView
          contentContainerStyle={containerStyles}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          <Box flex={1} paddingBottom="5" paddingHorizontal="5">
            <Text fontWeight={800} variant="heading03">
              {title}
            </Text>
          </Box>
          {children}
        </Animated.ScrollView>
      </Box>
    </>
  );
}
