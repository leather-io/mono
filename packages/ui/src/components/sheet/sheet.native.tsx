import { RefObject } from 'react';

import BottomSheet, {
  BottomSheetModal,
  type BottomSheetModalProps,
  BottomSheetModalProvider,
  BottomSheetProps,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { BottomSheetScrollViewProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/types';
import { BottomSheetViewProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetView/types';
import { createBox } from '@shopify/restyle';

import { Theme } from '@leather.io/ui/native';

import { createTextInput } from '../input/text-input.native';
import { SheetNativeBackdrop } from './sheet-backdrop.native';
import {
  SheetFlashList,
  SheetScrollView,
  SheetSectionList,
  SheetView,
  SheetVirtualizedList,
} from './sheet-containers.native';
import { SheetHeader, SheetTitle } from './sheet-header.native';
import { useSheetStyles } from './sheet.styles.native';

const defaultHandlePlacement = 'outside';

export interface SheetProps extends BottomSheetModalProps {
  ref: React.RefObject<BottomSheetModal | null>;
  handlePlacement?: 'inside' | 'outside';
}

export function Sheet({
  handlePlacement = defaultHandlePlacement,
  backgroundStyle,
  handleStyle,
  handleIndicatorStyle,
  ...props
}: SheetProps) {
  const styles = useSheetStyles({ handlePlacement });

  return (
    <BottomSheetModal
      backdropComponent={SheetNativeBackdrop}
      backgroundStyle={[styles.background, backgroundStyle]}
      handleStyle={[styles.handleContainer, handleStyle]}
      handleIndicatorStyle={[styles.handleIndicator, handleIndicatorStyle]}
      stackBehavior="push"
      {...props}
    />
  );
}

export interface PermanentSheetProps extends BottomSheetProps {
  ref: React.RefObject<BottomSheet | null>;
  handlePlacement?: 'inside' | 'outside';
}

export function PermanentSheet({
  handlePlacement = defaultHandlePlacement,
  backgroundStyle,
  handleStyle,
  handleIndicatorStyle,
  ...props
}: PermanentSheetProps) {
  const styles = useSheetStyles({ handlePlacement });

  return (
    <BottomSheet
      backdropComponent={null}
      backgroundStyle={[styles.background, backgroundStyle]}
      handleStyle={[styles.handleContainer, handleStyle]}
      handleIndicatorStyle={[styles.handleIndicator, handleIndicatorStyle]}
      {...props}
    />
  );
}

export type SheetInstance = BottomSheetModal;
export type PermanentSheetInstance = BottomSheet;
export type SheetRef = RefObject<SheetInstance | null>;
export const SheetModalProvider = BottomSheetModalProvider;
Sheet.View = createBox<Theme, BottomSheetViewProps>(SheetView);
Sheet.ScrollView = createBox<Theme, BottomSheetScrollViewProps>(SheetScrollView);
Sheet.SectionList = SheetSectionList;
Sheet.VirtualizedList = SheetVirtualizedList;
Sheet.FlashList = SheetFlashList;
Sheet.TextInput = createTextInput(BottomSheetTextInput);
Sheet.Header = SheetHeader;
Sheet.Title = SheetTitle;
