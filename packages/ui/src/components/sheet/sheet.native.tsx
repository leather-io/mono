import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

interface SheetProps {
  children: React.ReactNode;
  contentContainerStyle?: Record<string, unknown>;
  contentInset?: Record<string, unknown>;
  horizontal?: boolean;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  style?: Record<string, unknown>;
}

export function Sheet({
  children,
  horizontal = false,
  style,
  contentContainerStyle,
  contentInset,
  onScroll,
}: SheetProps) {
  return (
    <ScrollView
      onScroll={onScroll}
      horizontal={horizontal}
      style={{ ...style }}
      contentContainerStyle={{
        ...contentContainerStyle,
      }}
      contentInset={contentInset}
    >
      {children}
    </ScrollView>
  );
}
