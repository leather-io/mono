import Animated from 'react-native-reanimated';

import { useScreenScrollContext } from '@/components/screen/screen-scroll-context';
import { NormalizeScrollContainerProps } from '@/components/screen/screen.types';
import { useSafeBottomInset } from '@/components/screen/use-safe-bottom-inset';
import { FlashList, FlashListProps } from '@shopify/flash-list';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as typeof FlashList;

type ScreenFlashlistProps<T> = NormalizeScrollContainerProps<FlashListProps<T>>;

export function ScreenFlashlist<T>({
  onScrollBeginDrag,
  onScrollEndDrag,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
  contentContainerStyle,
  ...props
}: ScreenFlashlistProps<T>) {
  const bottomInset = useSafeBottomInset();
  const { scrollRef, scrollHandler, debouncedFixScroll } = useScreenScrollContext();

  return (
    <AnimatedFlashList
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
