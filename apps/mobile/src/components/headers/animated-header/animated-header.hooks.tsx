import { useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useScrollViewStyles } from '@/hooks/use-scroll-view-styles';

export function useAnimatedHeader(triggerAnimationYValue: number = 68) {
  const defaultStyles = useScrollViewStyles();
  const [contentHeight, setContentHeight] = useState(0);
  const [viewHeight, setViewHeight] = useState(0);
  const scrollY = useSharedValue(0);

  return {
    defaultStyles,
    contentHeight,
    viewHeight,
    scrollY,
    onScrollHandler: useAnimatedScrollHandler({
      onScroll: event => {
        scrollY.value = event.contentOffset.y;
      },
    }),
    animatedHeaderStyle: useAnimatedStyle(() => {
      const opacity = withTiming(scrollY.value >= triggerAnimationYValue ? 1 : 0, {
        duration: 300,
      });
      return {
        opacity,
      };
    }),
    onContentSizeChange(_: number, height: number) {
      setContentHeight(height);
    },
    onLayoutChange(event: LayoutChangeEvent) {
      const { height } = event.nativeEvent.layout;
      setViewHeight(height);
    },
  };
}
