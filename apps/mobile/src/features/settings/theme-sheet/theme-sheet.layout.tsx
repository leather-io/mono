import { RefObject } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings } from '@/store/settings/settings.write';
import { HasChildren } from '@/utils/types';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Box, Sheet, SheetHeader, SheetRef, SunInCloudIcon, Theme } from '@leather.io/ui/native';

interface ThemeSheetLayoutProps extends HasChildren {
  sheetRef: RefObject<SheetRef>;
}
export function ThemeSheetLayout({ children, sheetRef }: ThemeSheetLayoutProps) {
  const { bottom } = useSafeAreaInsets();
  const { theme: themeVariant } = useSettings();
  const theme = useTheme<Theme>();

  return (
    <Sheet isScrollView ref={sheetRef} themeVariant={themeVariant}>
      <Box
        style={{
          gap: theme.spacing[5],
          paddingBottom: theme.spacing['5'] + bottom,
          paddingHorizontal: theme.spacing['5'],
          paddingTop: theme.spacing['4'],
        }}
      >
        <SheetHeader
          icon={
            <Box bg="ink.background-secondary" borderRadius="round" flexDirection="row" p="2">
              <SunInCloudIcon color="ink.text-primary" />
            </Box>
          }
          onPressSupport={() => {}}
          title={t`Theme`}
        />
        {children}
      </Box>
    </Sheet>
  );
}
