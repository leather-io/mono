import Animated, { SharedValue, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { useSettings } from '@/store/settings/settings';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';

import { Box, Theme } from '@leather.io/ui/native';

const blurOverlayVisibilityThreshold = 6;
const blurOverlayHeight = 22;

const AnimatedBox = Animated.createAnimatedComponent(Box);

interface HeaderBlurOverlay {
  scrollY: SharedValue<number>;
}

export function HeaderBlurOverlay({ scrollY }: HeaderBlurOverlay) {
  const { themeDerivedFromThemePreference } = useSettings();
  const theme = useTheme<Theme>();
  const gradientTransparentStopColor = getTransparentStopColor(themeDerivedFromThemePreference);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, blurOverlayVisibilityThreshold], [0, 1], 'clamp'),
    };
  });

  return (
    <AnimatedBox zIndex="10" style={animatedStyle}>
      <LinearGradient
        style={{
          //backgroundColor: 'red',
          position: 'absolute',
          marginBottom: -blurOverlayHeight,
          bottom: 0,
          right: 0,
          left: 0,
          height: blurOverlayHeight,
        }}
        colors={[theme.colors['ink.background-primary'], gradientTransparentStopColor]}
      />
    </AnimatedBox>
  );
}

function getTransparentStopColor(theme: 'light' | 'dark') {
  // TODO: LEA-2725 - Use alpha color scale once added
  const darkTransparentStop = 'rgba(27,26,23,0)';
  const lightTransparentStop = 'rgba(255,255,255,0)';
  return theme === 'light' ? lightTransparentStop : darkTransparentStop;
}
