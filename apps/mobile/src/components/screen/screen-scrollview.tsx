import Animated, { AnimatedScrollViewProps } from 'react-native-reanimated';

import { useScreenScrollContext } from '@/components/screen/screen-scroll-context';
import { NormalizeScrollContainerProps } from '@/components/screen/screen.types';
import { useSafeBottomInset } from '@/components/screen/use-safe-bottom-inset';

type ScreenScrollviewProps = NormalizeScrollContainerProps<AnimatedScrollViewProps>;

export function ScreenScrollView({
  onScrollBeginDrag,
  onScrollEndDrag,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
  contentContainerStyle,
  ...props
}: ScreenScrollviewProps) {
  const bottomInset = useSafeBottomInset();
  const { scrollRef, scrollHandler, debouncedFixScroll } = useScreenScrollContext();

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
      contentContainerStyle={[{ paddingBottom: bottomInset }, contentContainerStyle]}
      {...props}
    />
  );
}
