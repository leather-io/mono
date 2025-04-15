import { useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import {
  AnimatedStyle,
  SharedValue,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useScrollViewStyles } from '@/hooks/use-scroll-view-styles';

const blurOverlayVisibilityThreshold = 12;
export const secondaryTitleVisibilityThreshold = 26;

interface AnimatedHeaderResult {
  defaultStyles: ReturnType<typeof useScrollViewStyles>;
  contentHeight: number;
  viewHeight: number;
  scrollY: SharedValue<number>;
  secondaryTitleVisibilityThreshold: number;
  onScrollHandler: ReturnType<typeof useAnimatedScrollHandler>;
  animatedHeaderStyle: AnimatedStyle;
  animatedBlurOverlayStyle: AnimatedStyle;
  onContentSizeChange: (width: number, height: number) => void;
  onLayoutChange: (event: LayoutChangeEvent) => void;
}

export function useAnimatedHeader(
  triggerAnimationYValue = secondaryTitleVisibilityThreshold
): AnimatedHeaderResult {
  const defaultStyles = useScrollViewStyles();
  const [contentHeight, setContentHeight] = useState(0);
  const [viewHeight, setViewHeight] = useState(0);
  const scrollY = useSharedValue(0);

  return {
    defaultStyles,
    contentHeight,
    viewHeight,
    scrollY,
    secondaryTitleVisibilityThreshold,
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
