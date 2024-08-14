import { ReactNode, forwardRef } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
  useBottomSheet,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@shopify/restyle';
import { BlurView } from 'expo-blur';

import { Box, Theme, TouchableOpacity, createTextInput } from '@leather.io/ui/native';

export const UIBottomSheetTextInput = createTextInput(BottomSheetTextInput);

const absoluteStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
} satisfies ViewStyle;

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

function Backdrop({ animatedIndex }: BottomSheetBackdropProps) {
  const { close } = useBottomSheet();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedIndex.value, [-1, -0.5], [0, 0.3], Extrapolation.CLAMP),
  }));

  const animatedProps = useAnimatedProps(() => {
    const intensity = interpolate(animatedIndex.value, [-1, -0.5], [0, 15], Extrapolation.CLAMP);
    return {
      intensity,
    };
  });

  return (
    <AnimatedBlurView
      animatedProps={animatedProps}
      tint="systemChromeMaterial"
      style={[
        {
          width: '100%',
          justifyContent: 'center',
        },
        absoluteStyle,
      ]}
    >
      <Animated.View
        style={[
          {
            backgroundColor: 'black',
          },
          absoluteStyle,
          animatedStyle,
        ]}
      >
        <TouchableOpacity onPress={() => close()} style={{ flex: 1 }} />
      </Animated.View>
    </AnimatedBlurView>
  );
}
export const CLOSED_ANIMATED_POSITION = -888;

export const Modal = forwardRef<
  BottomSheetModal,
  {
    isScrollView?: boolean;
    children: ReactNode;
    animatedPosition?: SharedValue<number>;
    onDismiss?(): void;
  }
>(function ({ isScrollView, children, animatedPosition, onDismiss }, ref) {
  const defaultAnimatedPosition = useSharedValue(CLOSED_ANIMATED_POSITION);
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const internalAnimatedPosition = animatedPosition ?? defaultAnimatedPosition;
  const BottomSheetComponent = isScrollView ? BottomSheetScrollView : BottomSheetView;
  return (
    <BottomSheetModal
      stackBehavior="push"
      onDismiss={onDismiss}
      enableDynamicSizing
      ref={ref}
      enablePanDownToClose
      backdropComponent={Backdrop}
      animatedPosition={internalAnimatedPosition}
      handleComponent={() => (
        <Box position="absolute" top={-12} width="100%" alignItems="center">
          <Box height={6} width={60} borderRadius="round" bg="green.background-primary" />
        </Box>
      )}
    >
      <BottomSheetComponent
        style={{
          paddingBottom: bottom,
          borderTopLeftRadius: theme.borderRadii.lg,
          borderTopRightRadius: theme.borderRadii.lg,
          overflow: 'hidden',
        }}
      >
        {children}
      </BottomSheetComponent>
    </BottomSheetModal>
  );
});
