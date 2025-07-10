import { forwardRef, useImperativeHandle, useState } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';

import { Box, Theme } from '@leather.io/ui/native';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const defaultGradientWidth = '200%';
export interface BrowserLoadingMethods {
  activate(): void;
  deactivate(): void;
}
export const BrowserLoading = forwardRef<BrowserLoadingMethods>(function (_, ref) {
  const gradientWidth = useSharedValue<`${number}%`>(defaultGradientWidth);
  const animatedStyles = useAnimatedStyle(() => ({
    width: gradientWidth.value,
  }));
  const { colors } = useTheme<Theme>();
  const [isActive, setIsActive] = useState(false);

  useImperativeHandle(ref, () => {
    return {
      activate() {
        gradientWidth.value = withRepeat(
          withTiming('70%', { duration: 1000, easing: Easing.inOut(Easing.quad) }),
          -1,
          true
        );
        setIsActive(true);
      },
      deactivate() {
        gradientWidth.value = defaultGradientWidth;
        setIsActive(false);
      },
    };
  }, [gradientWidth]);

  if (!isActive) return null;

  return (
    <Box position="absolute" width="100%" alignItems="center" height={5} top={0} zIndex="100">
      <AnimatedLinearGradient
        colors={['#FFFFFF00', colors['blue.action-primary-default'], '#FFFFFF00']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 1 }}
        style={[{ zIndex: 100, height: 5 }, animatedStyles]}
      />
    </Box>
  );
});
BrowserLoading.displayName = 'BrowserLoading';
