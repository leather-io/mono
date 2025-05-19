import { useCallback, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedProps,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { G, Mask, Path, Rect } from 'react-native-svg';

import { useTheme } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

interface QrScannerFrameProps {
  state: 'default' | 'error';
}

export function QrScannerFrame({ state = 'default' }: QrScannerFrameProps) {
  const { width, height } = useWindowDimensions();
  const borderWidth = 3;
  const cutoutSize = 300;
  const cutoutX = (width - cutoutSize) / 2;
  const cutoutY = (height - cutoutSize) / 3;
  const theme = useTheme<Theme>();
  const { shakeProps, pathProps } = useFrameAnimations(state, theme);

  return (
    <Box position="absolute" top={0} left={0} right={0} bottom={0}>
      <Svg width="100%" height="100%">
        <Mask id="mask">
          <Rect width="100%" height="100%" fill="white" />
          <AnimatedRect
            animatedProps={shakeProps}
            x={cutoutX}
            y={cutoutY}
            width={cutoutSize}
            height={cutoutSize}
            fill="black"
            rx={8}
          />
        </Mask>
        <G fill={theme.colors['ink.background-overlay']}>
          <Rect width="100%" height="100%" mask="url(#mask)" />
          <Rect width="100%" height="100%" mask="url(#mask)" />
        </G>

        <AnimatedG animatedProps={shakeProps}>
          <AnimatedPath
            x={cutoutX - borderWidth}
            y={cutoutY - borderWidth}
            d="M0 298V228C0 226.343 1.34315 225 3 225C4.65685 225 6 226.343 6 228V298C6 299.105 6.89543 300 8 300H78C79.6569 300 81 301.343 81 303C81 304.657 79.6569 306 78 306H8C3.58172 306 0 302.418 0 298ZM300 298V228C300 226.343 301.343 225 303 225C304.657 225 306 226.343 306 228V298C306 302.418 302.418 306 298 306H228C226.343 306 225 304.657 225 303C225 301.343 226.343 300 228 300H298C299.105 300 300 299.105 300 298ZM0 78V8C0 3.58172 3.58172 2.57702e-07 8 0H78C79.6569 0 81 1.34315 81 3C81 4.65685 79.6569 6 78 6H8C6.89543 6 6 6.89543 6 8V78C6 79.6569 4.65685 81 3 81C1.34315 81 0 79.6569 0 78ZM300 78V8C300 6.89543 299.105 6 298 6H228C226.343 6 225 4.65685 225 3C225 1.34315 226.343 0 228 0H298C302.418 0 306 3.58172 306 8V78C306 79.6569 304.657 81 303 81C301.343 81 300 79.6569 300 78Z"
            animatedProps={pathProps}
          />
        </AnimatedG>
      </Svg>
    </Box>
  );
}

function useFrameAnimations(state: 'default' | 'error', theme: Theme) {
  const shake = useSharedValue(0);
  const colorProgress = useSharedValue(0);

  const triggerShakeAnimation = useCallback(() => {
    const config = {
      duration: 64,
      easing: Easing.linear,
    };

    shake.value = withSequence(
      withTiming(6, config),
      withTiming(-6, config),
      withTiming(3, config),
      withTiming(-3, config),
      withTiming(1, config),
      withTiming(-1, config),
      withTiming(0, config),
      withTiming(0, config)
    );
  }, [shake]);

  useEffect(() => {
    colorProgress.value = withSpring(state === 'error' ? 1 : 0, { duration: 150 });
  }, [colorProgress, state]);

  useEffect(() => {
    if (state === 'error') {
      triggerShakeAnimation();
    }
  }, [state, triggerShakeAnimation]);

  const shakeProps = useAnimatedProps(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const pathProps = useAnimatedProps(() => ({
    fill: interpolateColor(
      colorProgress.value,
      [0, 1],
      ['white', theme.colors['red.action-primary-default']]
    ),
  }));

  return {
    shakeProps,
    pathProps,
  };
}
