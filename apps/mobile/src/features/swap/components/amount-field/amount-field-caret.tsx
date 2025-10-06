import Animated, {
  cancelAnimation,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const blinkCycleDurationMs = 530;
const pauseAfterChangeMs = 300;
const caretHeight = 21;
const caretWidth = 1.5;
const defaultCaretColor = '#2cb5c1';

const caretStyles = {
  height: caretHeight,
  width: caretWidth,
  marginLeft: 1,
  top: 1,
};

interface AmountFieldCaretProps {
  value: string;
  color?: string;
}

export function AmountFieldCaret({ value, color = defaultCaretColor }: AmountFieldCaretProps) {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useAnimatedReaction(
    () => value,
    (currentValue, previousValue) => {
      if (previousValue === null) {
        opacity.value = createBlinkingCycleAnimation();
      } else if (currentValue !== previousValue) {
        cancelAnimation(opacity);
        opacity.value = createPausedThenBlinkingAnimation();
      }
    }
  );

  return <Animated.View style={[caretStyles, animatedStyle, { backgroundColor: color }]} />;
}

function createBlinkingCycleAnimation() {
  'worklet';
  return withRepeat(
    withSequence(
      withTiming(0, { duration: blinkCycleDurationMs }),
      withTiming(1, { duration: blinkCycleDurationMs })
    ),
    -1
  );
}

function createPausedThenBlinkingAnimation() {
  'worklet';
  return withDelay(
    pauseAfterChangeMs,
    withSequence(withTiming(1, { duration: 0 }), createBlinkingCycleAnimation())
  );
}
