import { RefObject } from 'react';

import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';

import { Sheet, SheetRef, Text } from '@leather.io/ui/native';

interface EmailAddressSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function EmailAddressSheet({ sheetRef }: EmailAddressSheetProps) {
  const { themeDerivedFromThemePreference } = useSettings();
  return (
    <Sheet isScrollView ref={sheetRef} themeVariant={themeDerivedFromThemePreference}>
      <Text>{t`Hello`}</Text>
    </Sheet>
  );
}
