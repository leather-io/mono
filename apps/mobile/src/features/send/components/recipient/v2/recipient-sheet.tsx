import { ReactNode, RefObject } from 'react';

import { useSettings } from '@/store/settings/settings';

import { Box, Sheet, SheetRef } from '@leather.io/ui/native';

interface RecipientSheetProps {
  sheetRef: RefObject<SheetRef>;
  children: ReactNode;
}

export function RecipientSheet({ sheetRef, children }: RecipientSheetProps) {
  const { themeDerivedFromThemePreference } = useSettings();

  return (
    <Sheet
      ref={sheetRef}
      shouldHaveContainer={false}
      themeVariant={themeDerivedFromThemePreference}
      enableDynamicSizing={false}
      keyboardBehavior="extend"
      snapPoints={['90%']}
    >
      <Box
        flex={1}
        backgroundColor="ink.background-primary"
        borderTopLeftRadius="lg"
        borderTopRightRadius="lg"
      >
        {children}
      </Box>
    </Sheet>
  );
}
