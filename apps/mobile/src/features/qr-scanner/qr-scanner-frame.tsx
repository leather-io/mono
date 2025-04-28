import { useCallback, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { G, Mask, Path, Rect } from 'react-native-svg';

import { useTheme } from '@shopify/restyle';

import { Box, Theme } from '@leather.io/ui/native';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedPath = Animated.createAnimatedComponent(Path);

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
  const { animatedProps, triggerShakeAnimation } = useShakeAnimation();

  useEffect(() => {
    if (state === 'error') {
      triggerShakeAnimation();
    }
  }, [state, triggerShakeAnimation]);

  return (
    <Box position="absolute" top={0} left={0} right={0} bottom={0}>
      <Svg width="100%" height="100%">
        <Mask id="mask">
          <Rect width="100%" height="100%" fill="white" />
          <AnimatedRect
            animatedProps={animatedProps}
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

        <AnimatedPath
          animatedProps={animatedProps}
          x={cutoutX - borderWidth}
          y={cutoutY - borderWidth}
          d="M0 298V228C0 226.343 1.34315 225 3 225C4.65685 225 6 226.343 6 228V298C6 299.105 6.89543 300 8 300H78C79.6569 300 81 301.343 81 303C81 304.657 79.6569 306 78 306H8C3.58172 306 0 302.418 0 298ZM300 298V228C300 226.343 301.343 225 303 225C304.657 225 306 226.343 306 228V298C306 302.418 302.418 306 298 306H228C226.343 306 225 304.657 225 303C225 301.343 226.343 300 228 300H298C299.105 300 300 299.105 300 298ZM0 78V8C0 3.58172 3.58172 2.57702e-07 8 0H78C79.6569 0 81 1.34315 81 3C81 4.65685 79.6569 6 78 6H8C6.89543 6 6 6.89543 6 8V78C6 79.6569 4.65685 81 3 81C1.34315 81 0 79.6569 0 78ZM300 78V8C300 6.89543 299.105 6 298 6H228C226.343 6 225 4.65685 225 3C225 1.34315 226.343 0 228 0H298C302.418 0 306 3.58172 306 8V78C306 79.6569 304.657 81 303 81C301.343 81 300 79.6569 300 78Z"
          fill={state === 'error' ? theme.colors['red.action-primary-default'] : 'white'}
        />
      </Svg>
    </Box>
  );
}

function useShakeAnimation() {
  const shake = useSharedValue(0);

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

  const animatedProps = useAnimatedProps(() => ({
    transform: [{ translateX: shake.value }],
  }));

  return {
    triggerShakeAnimation,
    animatedProps,
  };
}
