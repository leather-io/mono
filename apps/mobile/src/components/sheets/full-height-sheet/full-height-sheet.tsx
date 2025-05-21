import { RefObject } from 'react';

import { useSettings } from '@/store/settings/settings';

import { Sheet, SheetProps, SheetRef } from '@leather.io/ui/native';

interface FullHeightSheetProps extends Omit<SheetProps, 'themeVariant'> {
  sheetRef: RefObject<SheetRef | null>;
}
export function FullHeightSheet({ sheetRef, ...sheetProps }: FullHeightSheetProps) {
  const { themeDerivedFromThemePreference } = useSettings();

  return (
    <Sheet
      ref={sheetRef}
      snapPointVariant="fullHeightWithNotch"
      shouldHaveContainer={false}
      themeVariant={themeDerivedFromThemePreference}
      {...sheetProps}
    />
  );
}
