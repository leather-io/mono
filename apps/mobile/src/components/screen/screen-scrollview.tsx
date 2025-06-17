import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import Animated, { AnimatedScrollViewProps } from 'react-native-reanimated';

import { useScreenScrollContext } from '@/components/screen/screen-scroll-context';
import { useSafeBottomInset } from '@/components/screen/use-safe-bottom-inset';

interface ScreenScrollviewProps extends AnimatedScrollViewProps {
  onScrollBeginDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onScrollEndDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollBegin?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onMomentumScrollEnd?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  //onScrollWorklet?: (event: NativeScrollEvent) => void;
}

export function ScreenScrollView({
  onScrollBeginDrag,
  onScrollEndDrag,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
  //onScrollWorklet,
  ...props
}: ScreenScrollviewProps) {
  const bottomInset = useSafeBottomInset();
  const { scrollHandler, debouncedFixScroll, scrollRef } = useScreenScrollContext();

  return (
    <Animated.ScrollView
      ref={scrollRef}
      scrollEventThrottle={16}
      overScrollMode="auto"
      onScroll={scrollHandler}
      onScrollBeginDrag={event => {
        debouncedFixScroll.cancel();
        onScrollBeginDrag?.(event);
      }}
      onScrollEndDrag={event => {
        debouncedFixScroll();
        onScrollEndDrag?.(event);
      }}
      onMomentumScrollBegin={event => {
        debouncedFixScroll.cancel();
        onMomentumScrollBegin?.(event);
      }}
      onMomentumScrollEnd={event => {
        debouncedFixScroll();
        onMomentumScrollEnd?.(event);
      }}
      contentInset={{ bottom: bottomInset }}
      {...props}
    />
  );
}
