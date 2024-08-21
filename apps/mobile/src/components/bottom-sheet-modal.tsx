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

import { Box, Theme, TouchableOpacity, createTextInput } from '@leather.io/ui/native';

import { ThemedBlurView } from './blur-view';

export const UIBottomSheetTextInput = createTextInput(BottomSheetTextInput);

const absoluteStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
} satisfies ViewStyle;

const AnimatedBlurView = Animated.createAnimatedComponent(ThemedBlurView);

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
export const CLOSED_ANIMATED_SHARED_VALUE = -888;

export const Modal = forwardRef<
  BottomSheetModal,
  {
    isScrollView?: boolean;
    children: ReactNode;
    animatedPosition?: SharedValue<number>;
    onDismiss?(): void;
    animatedIndex?: SharedValue<number>;
  }
>(function ({ isScrollView, children, animatedPosition, animatedIndex, onDismiss }, ref) {
  const defaultAnimatedPosition = useSharedValue(CLOSED_ANIMATED_SHARED_VALUE);
  const defaultAnimatedIndex = useSharedValue(CLOSED_ANIMATED_SHARED_VALUE);

  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const internalAnimatedPosition = animatedPosition ?? defaultAnimatedPosition;
  const internalAnimatedIndex = animatedIndex ?? defaultAnimatedIndex;

  const BottomSheetComponent = isScrollView ? BottomSheetScrollView : BottomSheetView;
  return (
    <BottomSheetModal
      animatedIndex={internalAnimatedIndex}
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
          backgroundColor: theme.colors['ink.background-primary'],
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
