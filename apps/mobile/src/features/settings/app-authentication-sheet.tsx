import { RefObject } from 'react';

import { useSettings } from '@/store/settings/settings.write';
import { t } from '@lingui/macro';

import { Sheet, SheetRef, Text } from '@leather.io/ui/native';

interface AppAuthenticationSheetProps {
  sheetRef: RefObject<SheetRef>;
}
export function AppAuthenticationSheet({ sheetRef }: AppAuthenticationSheetProps) {
  const { theme: themeVariant } = useSettings();

  return (
    <Sheet isScrollView ref={sheetRef} themeVariant={themeVariant}>
      <Text>{t`Hello`}</Text>
    </Sheet>
  );
}
