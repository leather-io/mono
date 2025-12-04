import { RefObject, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';

import BottomSheet, {
  BottomSheetModal,
  type BottomSheetModalProps,
  BottomSheetModalProvider,
  BottomSheetProps,
  BottomSheetTextInput,
  SNAP_POINT_TYPE,
  useBottomSheetModal,
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
  onChange,
  handlePlacement = defaultHandlePlacement,
  backgroundStyle,
  handleStyle,
  handleIndicatorStyle,
  ...props
}: SheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const styles = useSheetStyles({ handlePlacement });
  const { dismiss } = useBottomSheetModal();

  function handleChange(index: number, position: number, type: SNAP_POINT_TYPE) {
    setIsOpen(index >= 0);
    onChange?.(index, position, type);
  }

  useEffect(() => {
    if (!isOpen) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      dismiss();
      return true;
    });
    return subscription.remove;
  }, [isOpen, dismiss]);

  return (
    <BottomSheetModal
      onChange={handleChange}
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
      backdropComponent={undefined}
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
