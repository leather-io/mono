import { useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useScrollViewStyles } from '@/hooks/use-scroll-view-styles';

const blurOverlayVisibilityThreshold = 12;
const secondaryTitleVisibilityThreshold = 26;

export function useAnimatedHeader(triggerAnimationYValue = secondaryTitleVisibilityThreshold) {
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
    animatedBlurOverlayStyle: useAnimatedStyle(() => {
      return {
        opacity: interpolate(scrollY.value, [0, blurOverlayVisibilityThreshold], [0, 1], 'clamp'),
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
