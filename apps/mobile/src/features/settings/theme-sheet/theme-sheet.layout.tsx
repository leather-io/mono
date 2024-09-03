import { RefObject } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ModalHeader } from '@/components/headers/modal-header';
import { useSettings } from '@/store/settings/settings.write';
import { HasChildren } from '@/utils/types';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Box, Sheet, SheetRef, SunInCloudIcon, Theme } from '@leather.io/ui/native';

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
          paddingHorizontal: theme.spacing['5'],
          paddingTop: theme.spacing['4'],
          paddingBottom: theme.spacing['5'] + bottom,
          gap: theme.spacing[5],
        }}
      >
        <ModalHeader
          Icon={SunInCloudIcon}
          modalVariant="normal"
          onPressSupport={() => {}}
          title={t`Theme`}
        />
        {children}
      </Box>
    </Sheet>
  );
}
