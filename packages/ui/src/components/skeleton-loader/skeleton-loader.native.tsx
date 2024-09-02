import { useLayoutEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';

import { Box } from '../box/box.native';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const ANIMATION_DURATION = 1_000;
const ANIMATION_EASING = Easing.ease;
const LEFT_POS_START = -100;
const LEFT_POS_END = 100;

function SkeletonLoaderAnimation(props: React.ComponentProps<typeof Box>) {
  const theme = useTheme();
  const animatedLeft = useSharedValue(LEFT_POS_START);

  const color = theme.colors['ink.text-non-interactive'];

  useLayoutEffect(() => {
    const animationProgress = Date.now() % ANIMATION_DURATION;
    const initialLeftPos = interpolate(
      animationProgress,
      [0, ANIMATION_DURATION],
      [LEFT_POS_START, LEFT_POS_END]
    );

    // start animation from the interpolated position (synced with other loaders) and then repeat
    animatedLeft.value = withSequence(
      withTiming(initialLeftPos, { duration: 0 }),
      withTiming(LEFT_POS_END, {
        duration: ANIMATION_DURATION - animationProgress,
        easing: ANIMATION_EASING,
      }),
      withTiming(LEFT_POS_START, { duration: 0 }),
      withRepeat(
        withTiming(LEFT_POS_END, { duration: ANIMATION_DURATION, easing: ANIMATION_EASING }),
        -1
      )
    );
  }, []);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      left: `${animatedLeft.value}%`,
      backgroundColor: color,
    };
  });

  return (
    <Box backgroundColor="ink.text-non-interactive" borderRadius="sm" {...props} overflow="hidden">
      <AnimatedLinearGradient
        colors={[color, 'rgba(255, 255, 255, 0.75)', color]}
        start={{ x: 0.1, y: 1 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.gradientAnimation, animatedStyles]}
      />
    </Box>
  );
}

interface SkeletonLoaderProps extends React.ComponentProps<typeof Box> {
  isLoading: boolean;
  children?: React.ReactNode;
}

export function SkeletonLoader({ children, isLoading, ...rest }: SkeletonLoaderProps) {
  if (isLoading) {
    return <SkeletonLoaderAnimation {...rest} />;
  }

  return children;
}

const styles = StyleSheet.create({
  gradientAnimation: {
    position: 'absolute',
    width: '100%',
    top: '-50%',
    height: '200%',
    transform: [{ rotateZ: '15deg' }],
  },
});
