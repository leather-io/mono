import { ComponentProps } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BottomSheetFlashList,
  BottomSheetScrollView,
  BottomSheetSectionList,
  BottomSheetView,
  BottomSheetVirtualizedList,
} from '@gorhom/bottom-sheet';
import { BottomSheetFlashListProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/BottomSheetFlashList';
import { BottomSheetScrollViewProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/types';
import { BottomSheetViewProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetView/types';

import { useTheme } from '../../hooks/use-theme.native';

const minimumBottomOffset = 24;

function useSheetStyles() {
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();
  const paddingBottom = Math.max(bottom, minimumBottomOffset);

  return {
    root: {
      borderTopLeftRadius: theme.borderRadii.lg,
      borderTopRightRadius: theme.borderRadii.lg,
    },
    contentContainer: { paddingBottom },
  };
}

export function SheetView({ style, ...props }: BottomSheetViewProps) {
  const styles = useSheetStyles();
  return <BottomSheetView style={[styles.root, styles.contentContainer, style]} {...props} />;
}

export function SheetScrollView({
  style,
  contentContainerStyle,
  ...props
}: BottomSheetScrollViewProps) {
  const styles = useSheetStyles();
  return (
    <BottomSheetScrollView
      style={[styles.root, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      {...props}
    />
  );
}

export function SheetSectionList({
  style,
  contentContainerStyle,
  ...props
}: ComponentProps<typeof BottomSheetSectionList>) {
  const styles = useSheetStyles();
  return (
    <BottomSheetSectionList
      style={[styles.root, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      {...props}
    />
  );
}

export function SheetVirtualizedList({
  style,
  contentContainerStyle,
  ...props
}: ComponentProps<typeof BottomSheetVirtualizedList>) {
  const styles = useSheetStyles();
  return (
    <BottomSheetVirtualizedList
      style={[styles.root, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      {...props}
    />
  );
}

export function SheetFlashList<T>({
  style,
  contentContainerStyle,
  ...props
}: BottomSheetFlashListProps<T>) {
  const styles = useSheetStyles();
  return (
    <BottomSheetFlashList
      style={[styles.root, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      {...props}
    />
  );
}
