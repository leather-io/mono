import { RefObject } from 'react';

import { useSettings } from '@/store/settings/settings';

import { Sheet, SheetProps, SheetRef } from '@leather.io/ui/native';

interface FullHeightSheetProps<T = unknown> extends Omit<SheetProps<T>, 'themeVariant'> {
  sheetRef: RefObject<SheetRef | null>;
}
export function FullHeightSheet<T = unknown>({ sheetRef, ...sheetProps }: FullHeightSheetProps<T>) {
  const { themeDerivedFromThemePreference } = useSettings();

  return (
    <Sheet<T>
      ref={sheetRef}
      snapPointVariant="fullHeightWithNotch"
      shouldHaveContainer={false}
      themeVariant={themeDerivedFromThemePreference}
      {...sheetProps}
    />
  );
}
