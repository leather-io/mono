import { ReactNode, RefObject } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings } from '@/store/settings/settings';

import { Box, Sheet, SheetRef, useTheme } from '@leather.io/ui/native';

interface FeeSheetLayoutProps {
  sheetRef: RefObject<SheetRef | null>;
  children: ReactNode;
}

export function FeeSheetLayout({ sheetRef, children }: FeeSheetLayoutProps) {
  const { bottom } = useSafeAreaInsets();
  const { themeDerivedFromThemePreference } = useSettings();
  const theme = useTheme();

  return (
    <Sheet isScrollView ref={sheetRef} themeVariant={themeDerivedFromThemePreference}>
      <Box
        style={{
          paddingBottom: theme.spacing[5] + bottom,
          paddingTop: theme.spacing[5],
        }}
        gap="3"
        p="3"
      >
        {children}
      </Box>
    </Sheet>
  );
}
