import { useState } from 'react';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedTitleHeader } from '@/components/headers/animated-title-header';
import { NetworkBadge } from '@/components/network-badge';
import { useScrollViewStyles } from '@/hooks/use-scroll-view-styles';
import { HasChildren } from '@/utils/types';

import { Box, Text } from '@leather.io/ui/native';

interface AnimatedSettingsScreenLayoutProps extends HasChildren {
  title: string;
}
export function AnimatedSettingsScreenLayout({
  children,
  title,
}: AnimatedSettingsScreenLayoutProps) {
  const defaultStyles = useScrollViewStyles();
  const [contentHeight, setContentHeight] = useState(0);
  const [viewHeight, setViewHeight] = useState(0);
  const scrollY = useSharedValue(0);

  const onScrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const opacity = withTiming(scrollY.value >= 68 ? 1 : 0, { duration: 300 });
    const translationX = withTiming(scrollY.value >= 68 ? 0 : 25, { duration: 300 });
    return {
      opacity,
      transform: [{ translateX: translationX }],
    };
  });

  function onContentSizeChange(_: number, height: number) {
    setContentHeight(height);
  }

  function onLayoutChange(event: any) {
    const { height } = event.nativeEvent.layout;
    setViewHeight(height);
  }

  return (
    <>
      <AnimatedTitleHeader
        animatedStyle={animatedHeaderStyle}
        rightElement={<NetworkBadge />}
        title={title}
      />
      <Box backgroundColor="ink.background-primary" flex={1} onLayout={onLayoutChange}>
        <Animated.ScrollView
          contentContainerStyle={defaultStyles}
          onContentSizeChange={onContentSizeChange}
          onScroll={onScrollHandler}
          scrollEnabled={contentHeight > viewHeight}
          scrollEventThrottle={16}
        >
          <Box flex={1} paddingBottom="5">
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
