import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useSettings } from '@/store/settings/settings';
import { Image } from 'expo-image';

import { Box, useOnMount } from '@leather.io/ui/native';

const AnimatedBox = Animated.createAnimatedComponent(Box);
const duration = 1000;
const easing = Easing.linear;
export function SpinnerIcon({ invertColors }: { invertColors?: boolean }) {
  const { whenTheme } = useSettings();
  const spin = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  useOnMount(() => {
    spin.value = withRepeat(withTiming(1, { duration, easing }), -1);
  });

  return (
    <AnimatedBox style={animatedStyle}>
      {whenTheme({
        light: (
          <Image
            onLoad={() => {
              spin.value = withRepeat(withTiming(1, { duration, easing }), -1);
            }}
            style={{ height: 24, width: 24 }}
            contentFit="cover"
            source={
              invertColors
                ? require('@/assets/spinner-dark.png')
                : require('@/assets/spinner-light.png')
            }
          />
        ),
        dark: (
          <Image
            style={{ height: 24, width: 24 }}
            contentFit="cover"
            source={
              invertColors
                ? require('@/assets/spinner-light.png')
                : require('@/assets/spinner-dark.png')
            }
          />
        ),
      })}
    </AnimatedBox>
  );
}
