import Animated, { FlatListPropsWithLayout } from 'react-native-reanimated';

import { useScreenScrollContext } from '@/components/screen/screen-scroll-context';
import { NormalizeScrollContainerProps } from '@/components/screen/screen.types';
import { useSafeBottomInset } from '@/components/screen/use-safe-bottom-inset';

type ScreenListProps<T> = NormalizeScrollContainerProps<FlatListPropsWithLayout<T>>;

export function ScreenList<T>({
  onScrollBeginDrag,
  onScrollEndDrag,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
  ...props
}: ScreenListProps<T>) {
  const bottomInset = useSafeBottomInset();
  const { scrollRef, scrollHandler, debouncedFixScroll } = useScreenScrollContext();

  return (
    <Animated.FlatList
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
      contentContainerStyle={{ paddingBottom: bottomInset }}
      {...props}
    />
  );
}
