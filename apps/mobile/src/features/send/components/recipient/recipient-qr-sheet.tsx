import { ReactNode, RefObject } from 'react';

import { useSettings } from '@/store/settings/settings';

import { Sheet, SheetRef } from '@leather.io/ui/native';

interface RecipientQrSheetProps {
  sheetRef: RefObject<SheetRef | null>;
  children: ReactNode;
}

export function RecipientQrSheet({ sheetRef, children }: RecipientQrSheetProps) {
  const { themeDerivedFromThemePreference } = useSettings();

  return (
    <Sheet
      ref={sheetRef}
      themeVariant={themeDerivedFromThemePreference}
      handleComponent={null}
      snapPoints={['100%']}
      enableDynamicSizing={false}
      shouldHaveContainer={false}
    >
      {children}
    </Sheet>
  );
}
