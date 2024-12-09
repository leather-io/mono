import { ReactNode, RefObject, useRef } from 'react';
import { ScrollView } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@shopify/restyle';

import { Theme } from '@leather.io/ui/native';

const APPROXIMATE_DEFAULT_ITEM_SIZE = { height: 150, width: 300 };
interface DraggableProps {
  idx: number;
  cardId: string;
  cardsLength: number;
  placeholderIdx: SharedValue<null | number>;
  scrollViewRef: RefObject<ScrollView>;
  direction: SharedValue<'down' | 'up'>;
  onCardPress(cardId: string): void;
  swapCardIndexes(idx1: number | null, idx2: number | null): void;
  children: ReactNode;
  disableReorder?: boolean;
}

export function Draggable({
  idx,
  cardId,
  cardsLength,
  placeholderIdx,
  scrollViewRef,
  direction,
  onCardPress,
  swapCardIndexes,
  children,
  disableReorder,
}: DraggableProps) {
  const ref = useRef<Animated.View>(null);
  const theme = useTheme<Theme>();
  const zoom = useSharedValue(1);
  const thisItemDimensions = useSharedValue(APPROXIMATE_DEFAULT_ITEM_SIZE);
  const isAnimatedShared = useSharedValue(false);
  const translationY = useSharedValue(0);
  const thisItemPosition = useSharedValue({ x: 0, y: 0 });

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: translationY.value }, { scale: zoom.value }],
    position: isAnimatedShared.value ? 'absolute' : 'relative',
    zIndex: isAnimatedShared.value ? 20 : 1,
    width: '100%',
    top: isAnimatedShared.value ? thisItemPosition.value.y : 0,
    left: isAnimatedShared.value ? thisItemPosition.value.x : 0,
    shadowColor: theme.colors['ink.background-overlay'],
    shadowOffset: isAnimatedShared.value ? { width: 0, height: 2 } : undefined,
    shadowOpacity: isAnimatedShared.value ? 0.1 : 0,
    shadowRadius: 5,
  }));
  const placeholderUpAnimatedStyles = useAnimatedStyle(() => ({
    display: placeholderIdx.value === idx && direction.value === 'up' ? 'flex' : 'none',
    ...thisItemDimensions.value,
  }));
  const placeholderDownAnimatedStyles = useAnimatedStyle(() => ({
    display: placeholderIdx.value === idx && direction.value === 'down' ? 'flex' : 'none',
    ...thisItemDimensions.value,
  }));

  const pan = Gesture.Pan()
    .activateAfterLongPress(300)
    .minDistance(1)
    .onStart(() => {
      'worklet';
      zoom.value = withTiming(1.05);
      isAnimatedShared.value = true;
      placeholderIdx.value = idx;
    })
    .onUpdate(event => {
      'worklet';
      translationY.value = event.translationY;
      const idxDiff =
        event.translationY >= 0
          ? Math.floor(event.translationY / thisItemDimensions.value.height)
          : Math.floor(event.translationY / thisItemDimensions.value.height) + 1;

      direction.value = event.translationY >= 0 ? 'down' : 'up';

      const newIdx = idx + idxDiff;
      if (newIdx > cardsLength - 1) {
        placeholderIdx.value = cardsLength - 1;
      } else if (newIdx < 0) {
        placeholderIdx.value = 0;
      } else {
        placeholderIdx.value = newIdx;
      }
    })
    .onFinalize(() => {
      zoom.value = 1;
      isAnimatedShared.value = false;
      runOnJS(swapCardIndexes)(idx, placeholderIdx.value);

      placeholderIdx.value = null;
      translationY.value = 0;
    });

  const onPress = Gesture.Tap().onEnd(() => {
    runOnJS(onCardPress)(cardId);
  });

  const gestures = disableReorder ? onPress : Gesture.Exclusive(pan, onPress);

  return (
    <>
      <Animated.View style={placeholderUpAnimatedStyles} />
      <GestureDetector gesture={gestures}>
        <Animated.View
          onLayout={e => {
            const { height, width } = e.nativeEvent.layout;
            thisItemDimensions.value = { height, width };
          }}
          ref={ref}
          onTouchStart={() => {
            if (scrollViewRef.current && ref.current) {
              // @ts-expect-error it seems like measureLayout expects to receive a component ref that also has measureLayout.
              // It is not necessary for the component to have that function on the ref. Wrong RN types.
              ref.current.measureLayout(scrollViewRef.current, (x, y) => {
                thisItemPosition.value = { x, y };
              });
            }
          }}
          style={[animatedStyles]}
        >
          {children}
        </Animated.View>
      </GestureDetector>
      <Animated.View style={placeholderDownAnimatedStyles} />
    </>
  );
}
