import { ComponentProps } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';

const backdropColor = 'rgba(18,16,15,.5)';
const blurIntensity = 13;

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export function SheetNativeBackdrop(props: ComponentProps<typeof BottomSheetBackdrop>) {
  return (
    <>
      <BlurBackdrop animatedIndex={props.animatedIndex} />
      <BottomSheetBackdrop
        opacity={1}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        {...props}
        // eslint-disable-next-line leather/prefer-style-props
        style={{ backgroundColor: backdropColor }}
      />
    </>
  );
}

interface BlurBackdropProps {
  animatedIndex: SharedValue<number>;
}

function BlurBackdrop({ animatedIndex }: BlurBackdropProps) {
  const animatedProps = useAnimatedProps(() => {
    return {
      intensity: interpolate(
        animatedIndex.value,
        [-1, -0.5],
        [0, blurIntensity],
        Extrapolation.CLAMP
      ),
    };
  });
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedIndex.value, [-1, -0.5], [0, 1], Extrapolation.CLAMP),
  }));

  return Platform.select({
    ios: <AnimatedBlurView style={StyleSheet.absoluteFill} animatedProps={animatedProps} />,
    // BlurView on Android causes various rendering artifacts and performance issues.
    // Instead, double the backdrop to compensate for separation.
    android: (
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: backdropColor }, animatedStyle]}
      />
    ),
  });
}
