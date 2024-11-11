import { RefObject } from 'react';

import { useSettings } from '@/store/settings/settings';
import { HasChildren } from '@/utils/types';

import { Sheet, SheetRef } from '@leather.io/ui/native';

interface FullHeightSheetProps extends HasChildren {
  sheetRef: RefObject<SheetRef>;
}
export function FullHeightSheet({ children, sheetRef }: FullHeightSheetProps) {
  const { themeDerivedFromThemePreference } = useSettings();

  return (
    <Sheet
      isFullHeight
      ref={sheetRef}
      shouldHaveContainer={false}
      themeVariant={themeDerivedFromThemePreference}
    >
      {children}
    </Sheet>
  );
}
