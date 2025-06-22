/**
 * Based on https://github.com/codeherence/react-native-header
 *
 * @license
 * MIT License
 * Copyright (c) 2022 WorkOS
 * https://github.com/codeherence/react-native-header/blob/main/LICENSE
 * */
import { NativeScrollEvent } from 'react-native';
import {
  AnimatedRef,
  runOnUI,
  scrollTo,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useDebouncedCallback } from 'use-debounce';

interface UseScrollContainerLogicProps {
  enableHeaderAnimation?: boolean;
  scrollRef: AnimatedRef<any>;
  // A hack to ensure that the larger repositions itself correctly.
  adjustmentOffset?: number;
  disableAutoFixScroll?: boolean;
  headerFadeInThreshold?: number; // 0 to 1
  onScrollWorklet?: (evt: NativeScrollEvent) => void;
}

export function useScreenScroll({
  enableHeaderAnimation = false,
  scrollRef,
  disableAutoFixScroll = false,
  adjustmentOffset = 4,
  headerFadeInThreshold = 1,
  onScrollWorklet,
}: UseScrollContainerLogicProps) {
  const scrollY = useSharedValue(0);
  const animationTargetHeight = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler(
    event => {
      onScrollWorklet?.(event);
      scrollY.value = event.contentOffset.y;
    },
    [onScrollWorklet]
  );

  const headerVisibility = useDerivedValue<number>(() => {
    if (!enableHeaderAnimation) return 1;

    if (animationTargetHeight.value < adjustmentOffset) return 0;

    return withTiming(
      scrollY.value <= animationTargetHeight.value * headerFadeInThreshold - adjustmentOffset
        ? 0
        : 1,
      { duration: 250 }
    );
  }, []);

  const debouncedFixScroll = useDebouncedCallback(() => {
    if (disableAutoFixScroll || !enableHeaderAnimation) return;

    if (animationTargetHeight.value !== 0 && scrollRef && scrollRef.current) {
      if (
        scrollY.value >= animationTargetHeight.value / 2 &&
        scrollY.value < animationTargetHeight.value
      ) {
        runOnUI(() => {
          'worklet';
          scrollTo(scrollRef, 0, animationTargetHeight.value, true);
        })();
      } else if (scrollY.value >= 0 && scrollY.value < animationTargetHeight.value / 2) {
        runOnUI(() => {
          'worklet';
          scrollTo(scrollRef, 0, 0, true);
        })();
      }
    }
  }, 50);

  return {
    scrollY,
    headerVisibility,
    animationTargetHeight,
    scrollHandler,
    debouncedFixScroll,
  };
}
