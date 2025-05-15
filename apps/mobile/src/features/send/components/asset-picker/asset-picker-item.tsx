import { ReactElement, ReactNode, cloneElement, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HEADER_HEIGHT } from '@/shared/constants';

const parentTopPadding = 16;

// Wrapper around asset items for measuring and reporting vertical offsets for animation.
// This component really only exists to avoid converting BitcoinBalance and its dependencies to forwardRef.
export function AssetPickerItem({
  onPress,
  children,
}: {
  onPress(top: number | null): void;
  children: ReactNode;
}) {
  const pressableRef = useRef<View>(null);
  const { top: safeInsetTop } = useSafeAreaInsets();
  const [offsetTopRelativeToParent, setOffsetTopRelativeToParent] = useState<number | null>(null);
  // Calculate total Y distance from viewport using hardcoded values.
  // This should in theory be done using pageY value from https://reactnative.dev/docs/0.74/direct-manipulation#measurecallback
  // but lack of useLayoutEffect in the "old" architecture prevents us from reliably getting measurements on first render.
  const totalOffsetTop =
    offsetTopRelativeToParent === null
      ? null
      : safeInsetTop + HEADER_HEIGHT + parentTopPadding + offsetTopRelativeToParent;

  function handlePress() {
    onPress(totalOffsetTop);
  }

  return (
    <View
      ref={pressableRef}
      onLayout={layoutEvent => setOffsetTopRelativeToParent(layoutEvent.nativeEvent.layout.y)}
    >
      {cloneElement(children as ReactElement<Partial<{ onPress(): void }>>, {
        onPress: handlePress,
      })}
    </View>
  );
}
