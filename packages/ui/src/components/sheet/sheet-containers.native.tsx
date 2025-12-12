import { ComponentProps } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BottomSheetScrollView,
  BottomSheetSectionList,
  BottomSheetView,
  BottomSheetVirtualizedList,
  useBottomSheetScrollableCreator,
} from '@gorhom/bottom-sheet';
import { BottomSheetScrollViewProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/types';
import { BottomSheetViewProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetView/types';
import { FlashList, FlashListProps } from '@shopify/flash-list';

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
  return (
    <BottomSheetView
      style={StyleSheet.flatten([styles.root, styles.contentContainer, style])}
      {...props}
    />
  );
}

export function SheetScrollView({
  style,
  contentContainerStyle,
  ...props
}: BottomSheetScrollViewProps) {
  const styles = useSheetStyles();
  return (
    <BottomSheetScrollView
      style={StyleSheet.flatten([styles.root, style])}
      contentContainerStyle={StyleSheet.flatten([styles.contentContainer, contentContainerStyle])}
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
      style={StyleSheet.flatten([styles.root, style])}
      contentContainerStyle={StyleSheet.flatten([styles.contentContainer, contentContainerStyle])}
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
      style={StyleSheet.flatten([styles.root, style])}
      contentContainerStyle={StyleSheet.flatten([styles.contentContainer, contentContainerStyle])}
      {...props}
    />
  );
}

export function SheetFlashList<T>({ style, contentContainerStyle, ...props }: FlashListProps<T>) {
  const styles = useSheetStyles();
  const renderScrollComponent = useBottomSheetScrollableCreator();

  return (
    <FlashList
      renderScrollComponent={renderScrollComponent}
      style={StyleSheet.flatten([styles.root, style])}
      contentContainerStyle={StyleSheet.flatten([styles.contentContainer, contentContainerStyle])}
      {...props}
    />
  );
}
