import { RefObject } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings } from '@/store/settings/settings';
import { useTheme } from '@shopify/restyle';

import { Box, HasChildren, Sheet, SheetHeader, SheetRef, Theme } from '@leather.io/ui/native';

interface SettingsSheetLayoutProps extends HasChildren {
  sheetRef: RefObject<SheetRef | null>;
  title: string;
  onPressSupport?: () => void;
}
export function SettingsSheetLayout({
  children,
  sheetRef,
  title,
  onPressSupport,
}: SettingsSheetLayoutProps) {
  const { bottom } = useSafeAreaInsets();
  const { themeDerivedFromThemePreference } = useSettings();
  const theme = useTheme<Theme>();

  return (
    <Sheet isScrollView ref={sheetRef} themeVariant={themeDerivedFromThemePreference}>
      <Box
        style={{
          paddingBottom: theme.spacing[5] + bottom,
          paddingHorizontal: theme.spacing[5],
          paddingTop: theme.spacing[4],
        }}
      >
        <SheetHeader onPressSupport={onPressSupport ? onPressSupport : undefined} title={title} />
        <Box mx="-5">{children}</Box>
      </Box>
    </Sheet>
  );
}
