import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Box,
  HasChildren,
  QuestionCircleIcon,
  Sheet,
  SheetRef,
  TouchableOpacity,
} from '@leather.io/ui/native';

interface SettingsSheetLayoutProps extends HasChildren {
  sheetRef: SheetRef;
  title: string;
  onPressSupport?: () => void;
}
export function SettingsSheetLayout({
  children,
  sheetRef,
  title,
  onPressSupport,
}: SettingsSheetLayoutProps) {
  const maxHeight = useSettingsSheetMaxHeight();

  return (
    <Sheet ref={sheetRef} maxDynamicContentSize={maxHeight}>
      <Sheet.ScrollView stickyHeaderIndices={[0]}>
        <Sheet.Header
          leftElement={<Sheet.Title>{title}</Sheet.Title>}
          rightElement={
            onPressSupport ? (
              <TouchableOpacity onPress={onPressSupport} zIndex="10">
                <QuestionCircleIcon variant="small" />
              </TouchableOpacity>
            ) : undefined
          }
        />
        <Box pb="5">{children}</Box>
      </Sheet.ScrollView>
    </Sheet>
  );
}

function useSettingsSheetMaxHeight() {
  const { height } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  const minimumTopOffset = 120;
  return height - Math.max(top, minimumTopOffset);
}
