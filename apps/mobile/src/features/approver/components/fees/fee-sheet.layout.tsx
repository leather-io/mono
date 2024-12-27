import { ReactNode, RefObject } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings } from '@/store/settings/settings';
import { useTheme } from '@shopify/restyle';

import { Box, Sheet, SheetRef, Theme } from '@leather.io/ui/native';

interface FeeSheetLayoutProps {
  sheetRef: RefObject<SheetRef>;
  children: ReactNode;
}

export function FeeSheetLayout({ sheetRef, children }: FeeSheetLayoutProps) {
  const { bottom } = useSafeAreaInsets();
  const { themeDerivedFromThemePreference } = useSettings();
  const theme = useTheme<Theme>();

  return (
    <Sheet isScrollView ref={sheetRef} themeVariant={themeDerivedFromThemePreference}>
      <Box
        style={{
          paddingBottom: theme.spacing[5] + bottom,
          paddingTop: theme.spacing[4],
        }}
        gap="3"
        p="3"
      >
        {children}
      </Box>
    </Sheet>
  );
}
