import { RefObject } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings } from '@/store/settings/settings';
import { HasChildren } from '@/utils/types';
import { useTheme } from '@shopify/restyle';

import { Box, Sheet, SheetRef, Theme } from '@leather.io/ui/native';

interface FullHeightSheetLayoutProps extends HasChildren {
  header: React.ReactNode;
  sheetRef: RefObject<SheetRef>;
}
export function FullHeightSheetLayout({ children, header, sheetRef }: FullHeightSheetLayoutProps) {
  const { bottom } = useSafeAreaInsets();
  const { themeDerivedFromThemePreference } = useSettings();
  const theme = useTheme<Theme>();

  return (
    <Sheet isFullHeight isScrollView ref={sheetRef} themeVariant={themeDerivedFromThemePreference}>
      <Box paddingTop="4">{header}</Box>
      <Box
        style={{
          paddingBottom: theme.spacing[5] + bottom,
          paddingHorizontal: theme.spacing[5],
          paddingTop: theme.spacing[4],
        }}
      >
        {children}
      </Box>
    </Sheet>
  );
}
