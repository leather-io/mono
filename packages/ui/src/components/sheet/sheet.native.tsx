import { ReactNode, forwardRef } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@shopify/restyle';

import { Box, Theme, createTextInput } from '../../../native';
import { ThemeVariant } from '../../theme-native/theme';
import { Backdrop } from './components/sheet-backdrop.native';

export const UIBottomSheetTextInput = createTextInput(BottomSheetTextInput);

export type SheetRef = BottomSheetModal;
export const SheetProvider = BottomSheetModalProvider;

export const CLOSED_ANIMATED_SHARED_VALUE = -888;
export const Sheet = forwardRef<
  BottomSheetModal,
  {
    shouldHaveContainer?: boolean;
    isScrollView?: boolean;
    children: ReactNode;
    animatedPosition?: SharedValue<number>;
    onDismiss?(): void;
    animatedIndex?: SharedValue<number>;
    themeVariant: ThemeVariant;
  }
>(
  (
    {
      shouldHaveContainer = true,
      isScrollView,
      children,
      animatedPosition,
      animatedIndex,
      onDismiss,
      themeVariant,
    },
    ref
  ) => {
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
        backdropComponent={() => (
          <Backdrop
            animatedIndex={internalAnimatedIndex}
            animatedPosition={internalAnimatedPosition}
            themeVariant={themeVariant}
          />
        )}
        animatedPosition={internalAnimatedPosition}
        handleComponent={() => (
          <Box position="absolute" top={-12} width="100%" alignItems="center">
            <Box height={6} width={60} borderRadius="round" bg="green.background-primary" />
          </Box>
        )}
      >
        {shouldHaveContainer && (
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
        )}
        {!shouldHaveContainer && children}
      </BottomSheetModal>
    );
  }
);
