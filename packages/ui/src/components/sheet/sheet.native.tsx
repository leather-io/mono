import { ReactNode, forwardRef } from 'react';
import { Platform } from 'react-native';
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
    isFullHeight?: boolean;
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
      isFullHeight,
      isScrollView,
      children,
      animatedPosition,
      animatedIndex,
      onDismiss,
      themeVariant,
    },
    ref
  ) => {
    const { bottom, top } = useSafeAreaInsets();
    const theme = useTheme<Theme>();
    const defaultAnimatedPosition = useSharedValue(CLOSED_ANIMATED_SHARED_VALUE);
    const defaultAnimatedIndex = useSharedValue(CLOSED_ANIMATED_SHARED_VALUE);
    const internalAnimatedPosition = animatedPosition ?? defaultAnimatedPosition;
    const internalAnimatedIndex = animatedIndex ?? defaultAnimatedIndex;
    const BottomSheetComponent = isScrollView ? BottomSheetScrollView : BottomSheetView;
    const snapPoints = isFullHeight ? ['100%'] : undefined;
    return (
      <BottomSheetModal
        animatedIndex={internalAnimatedIndex}
        stackBehavior="push"
        onDismiss={onDismiss}
        enableDynamicSizing={!isFullHeight}
        snapPoints={snapPoints}
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
        handleComponent={() =>
          isFullHeight ? (
            <Box alignItems="center" padding="2" position="absolute" top={top} width="100%">
              <Box height={6} width={60} borderRadius="round" bg="ink.border-default" />
            </Box>
          ) : (
            <Box alignItems="center" position="absolute" top={-12} width="100%">
              <Box height={6} width={60} borderRadius="round" bg="ink.border-default" />
            </Box>
          )
        }
        // maestro can't find bottom sheet component without this:
        // https://github.com/mobile-dev-inc/maestro/issues/1493#issuecomment-1966447805
        accessible={Platform.select({
          // setting it to false on Android seems to cause issues with TalkBack instead
          ios: false,
        })}
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

Sheet.displayName = 'Sheet';
