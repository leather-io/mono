import { ComponentProps } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BottomSheetFlashList,
  BottomSheetScrollView,
  BottomSheetSectionList,
  BottomSheetView,
  BottomSheetVirtualizedList,
} from '@gorhom/bottom-sheet';
import { BottomSheetScrollViewProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/types';
import { BottomSheetViewProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetView/types';

import { useTheme } from '../../hooks/use-theme.native';

const minimumBottomOffset = 24;

function useSheetBorderRadius() {
  const theme = useTheme();
  return {
    borderTopLeftRadius: theme.borderRadii.lg,
    borderTopRightRadius: theme.borderRadii.lg,
  };
}

export function SheetView({ style, ...props }: BottomSheetViewProps) {
  const { bottom } = useSafeAreaInsets();
  const paddingBottom = Math.max(bottom, minimumBottomOffset);
  const borderRadius = useSheetBorderRadius();

  return <BottomSheetView style={[{ paddingBottom, ...borderRadius }, style]} {...props} />;
}

export function SheetScrollView({ style, ...props }: BottomSheetScrollViewProps) {
  const borderRadius = useSheetBorderRadius();
  return <BottomSheetScrollView style={[borderRadius, style]} {...props} />;
}

export function SheetSectionList({
  style,
  ...props
}: ComponentProps<typeof BottomSheetSectionList>) {
  const borderRadius = useSheetBorderRadius();
  return <BottomSheetSectionList style={[borderRadius, style]} {...props} />;
}

export function SheetVirtualizedList({
  style,
  ...props
}: ComponentProps<typeof BottomSheetVirtualizedList>) {
  const borderRadius = useSheetBorderRadius();
  return <BottomSheetVirtualizedList style={[borderRadius, style]} {...props} />;
}

export function SheetFlashList({ style, ...props }: ComponentProps<typeof BottomSheetFlashList>) {
  const borderRadius = useSheetBorderRadius();
  return <BottomSheetFlashList style={[borderRadius, style]} {...props} />;
}
