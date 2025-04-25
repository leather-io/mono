import React, { useLayoutEffect } from 'react';
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
const animationEasing = Easing.ease;
const leftPosStart = -100;
const leftPosEnd = 100;

function SkeletonLoaderAnimation(props: React.ComponentProps<typeof Box>) {
  const theme = useTheme();
  const animatedLeft = useSharedValue(leftPosStart);

  const color = theme.colors['ink.text-non-interactive'];

  useLayoutEffect(() => {
    const animationProgress = Date.now() % ANIMATION_DURATION;
    const initialLeftPos = interpolate(
      animationProgress,
      [0, ANIMATION_DURATION],
      [leftPosStart, leftPosEnd]
    );

    // start animation from the interpolated position (synced with other loaders) and then repeat
    animatedLeft.value = withSequence(
      withTiming(initialLeftPos, { duration: 0 }),
      withTiming(leftPosEnd, {
        duration: ANIMATION_DURATION - animationProgress,
        easing: animationEasing,
      }),
      withTiming(leftPosStart, { duration: 0 }),
      withRepeat(
        withTiming(leftPosEnd, { duration: ANIMATION_DURATION, easing: animationEasing }),
        -1
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      left: `${animatedLeft.value}%`,
      backgroundColor: color,
    };
  });

  return (
    <Box
      flex={1}
      backgroundColor="ink.text-non-interactive"
      borderRadius="xs"
      overflow="hidden"
      opacity={0.4}
      {...props}
    >
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
