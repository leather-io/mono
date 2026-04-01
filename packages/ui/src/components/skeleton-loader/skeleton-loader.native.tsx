import React, { useLayoutEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';

import { Box, type BoxProps } from '../box/box.native';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const ANIMATION_DURATION = 1_000;
const animationEasing = Easing.ease;
const leftPosStart = -100;
const leftPosEnd = 100;

interface SkeletonLoaderAnimationProps extends BoxProps {
  animationDelay?: number;
  animationDuration?: number;
  reverse?: boolean;
}
function SkeletonLoaderAnimation({
  animationDelay = 0,
  animationDuration = ANIMATION_DURATION,
  reverse = false,
  ...props
}: SkeletonLoaderAnimationProps) {
  const theme = useTheme();

  // Use animationDelay to create a unique duration for each loader
  const uniqueDuration = animationDuration + (animationDelay % 500);

  // Flip start/end positions if reversed
  const startPos = reverse ? leftPosEnd : leftPosStart;
  const endPos = reverse ? leftPosStart : leftPosEnd;

  const animatedLeft = useSharedValue(startPos);

  const color = theme.colors['ink.text-non-interactive'];

  useLayoutEffect(() => {
    animatedLeft.value = withRepeat(
      withSequence(
        withTiming(endPos, {
          duration: uniqueDuration,
          easing: animationEasing,
        }),
        withTiming(startPos, { duration: 0 })
      ),
      -1,
      false
    );
  }, [uniqueDuration, animatedLeft, startPos, endPos]);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      left: `${animatedLeft.value}%`,
      backgroundColor: color,
    };
  });

  const gradientColors: readonly [string, string, string] = reverse
    ? [color, 'rgba(255, 255, 255, 0.75)', color]
    : [color, 'rgba(255, 255, 255, 0.75)', color];

  return (
    <Box
      width="100%"
      backgroundColor="ink.text-non-interactive"
      borderRadius="xs"
      overflow="hidden"
      opacity={0.4}
      {...props}
    >
      <AnimatedLinearGradient
        colors={gradientColors}
        start={{ x: reverse ? 0.9 : 0.1, y: 1 }}
        end={{ x: reverse ? 0.1 : 0.9, y: 1 }}
        style={[styles.gradientAnimation, animatedStyles]}
      />
    </Box>
  );
}
interface SkeletonLoaderProps extends BoxProps {
  isLoading: boolean;
  animationDelay?: number;
  animationDuration?: number;
  children?: React.ReactNode;
  reverse?: boolean;
}

export function SkeletonLoader({
  children,
  isLoading,
  animationDelay,
  animationDuration,
  reverse,
  ...rest
}: SkeletonLoaderProps) {
  if (isLoading) {
    return (
      <SkeletonLoaderAnimation
        animationDelay={animationDelay}
        animationDuration={animationDuration}
        reverse={reverse}
        {...rest}
      />
    );
  }

  return children ?? null;
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
