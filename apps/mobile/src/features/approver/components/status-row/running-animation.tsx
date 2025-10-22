import { useEffect } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Box, useTheme } from '@leather.io/ui/native';

const { width } = Dimensions.get('window');

type PendingStatus = 'pending' | 'stalled';
const AnimatedBox = Animated.createAnimatedComponent(Box);

const tileWidth = 24;
const numberOfTiles = Math.ceil(width / 24) + 5;
const barHeight = 5;

export function RunningAnimation({ status }: { status: PendingStatus }) {
  const translateValue = useSharedValue(0);
  const { colors } = useTheme();
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: translateValue.value }],
  }));
  useEffect(() => {
    translateValue.value = withRepeat(
      withTiming(-96, { easing: Easing.linear, duration: 3000 }),
      -1
    );
  }, [translateValue]);
  return (
    <AnimatedBox style={animatedStyles} flexDirection="row">
      {new Array(numberOfTiles).fill(undefined).map((_, idx) => (
        <Box
          key={idx}
          width={tileWidth}
          height={barHeight}
          style={{
            backgroundColor:
              idx % 2 === 0
                ? status === 'stalled'
                  ? colors['red.action-primary-default']
                  : '#F07D12'
                : '#FFB977',
            transform: [{ skewX: '-30deg' }],
          }}
        />
      ))}
    </AnimatedBox>
  );
}
