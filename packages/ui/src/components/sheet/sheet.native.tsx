import { ReactNode, RefObject } from 'react';
import { Dimensions, Platform } from 'react-native';
import { SharedValue, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BottomSheetModal,
  type BottomSheetModalProps,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@shopify/restyle';

import { match } from '@leather.io/utils';

import { Box, Theme, createTextInput } from '../../../native';
import { ThemeVariant } from '../../theme-native';
import { Backdrop } from './components/sheet-backdrop.native';

const { height } = Dimensions.get('window');
export const CLOSED_ANIMATED_SHARED_VALUE = -888;

type SnapPointVariant = 'fullHeightWithNotch' | 'fullHeightWithoutNotch' | 'none';

export interface SheetProps extends Omit<BottomSheetModalProps, 'children'> {
  shouldHaveContainer?: boolean;
  snapPointVariant?: SnapPointVariant;
  isScrollView?: boolean;
  animatedPosition?: SharedValue<number>;
  animatedIndex?: SharedValue<number>;
  themeVariant: ThemeVariant;
  children: ReactNode | ReactNode[];
}

export type SheetRef = BottomSheetModal;

export function Sheet({
  shouldHaveContainer = true,
  snapPointVariant = 'none',
  isScrollView,
  children,
  animatedPosition,
  animatedIndex,
  onDismiss,
  themeVariant,
  ref,
  ...props
}: { ref: RefObject<SheetRef | null> } & SheetProps) {
  const { bottom, top } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const defaultAnimatedPosition = useSharedValue(CLOSED_ANIMATED_SHARED_VALUE);
  const defaultAnimatedIndex = useSharedValue(CLOSED_ANIMATED_SHARED_VALUE);
  const internalAnimatedPosition = animatedPosition ?? defaultAnimatedPosition;
  const internalAnimatedIndex = animatedIndex ?? defaultAnimatedIndex;
  const BottomSheetComponent = isScrollView ? BottomSheetScrollView : BottomSheetView;
  const snapPointVariantMatcher = match<SnapPointVariant>();
  const snapPoints = snapPointVariantMatcher(snapPointVariant, {
    fullHeightWithNotch: ['100%'],
    fullHeightWithoutNotch: [height - top - theme.spacing['5']],
    none: undefined,
  });
  const handleComponentTop = snapPointVariantMatcher(snapPointVariant, {
    fullHeightWithNotch: top,
    fullHeightWithoutNotch: -theme.spacing['4'],
    none: 0,
  });
  return (
    <BottomSheetModal
      animatedIndex={internalAnimatedIndex}
      stackBehavior="push"
      onDismiss={onDismiss}
      enableDynamicSizing={snapPointVariant === 'none'}
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
      handleComponent={() => (
        <Box
          alignItems="center"
          padding="2"
          position="absolute"
          top={handleComponentTop}
          width="100%"
        >
          <Box height={6} width={60} borderRadius="round" bg="ink.border-default" />
        </Box>
      )}
      // maestro can't find bottom sheet component without this:
      // https://github.com/mobile-dev-inc/maestro/issues/1493#issuecomment-1966447805
      accessible={Platform.select({
        // setting it to false on Android seems to cause issues with TalkBack instead
        ios: false,
      })}
      {...props}
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
Sheet.displayName = 'Sheet';

export const SheetProvider = BottomSheetModalProvider;
export const UIBottomSheetTextInput = createTextInput(BottomSheetTextInput);
