import { RefObject } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { Box, Sheet, SheetRef, Text, Theme } from '@leather.io/ui/native';

interface ReceiveAssetSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function ReceiveAssetSheet({ sheetRef }: ReceiveAssetSheetProps) {
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
        <Text>{t`Receive`}</Text>
      </Box>
    </Sheet>
  );
}
