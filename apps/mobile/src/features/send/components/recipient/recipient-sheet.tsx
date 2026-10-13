import { ReactNode } from 'react';

import { Box, Sheet, SheetRef } from '@leather.io/ui/native';

interface RecipientSheetProps {
  sheetRef: SheetRef;
  children: ReactNode;
  onDismiss?(): void;
}

export function RecipientSheet({ sheetRef, onDismiss, children }: RecipientSheetProps) {
  return (
    <Sheet
      ref={sheetRef}
      enableDynamicSizing={false}
      keyboardBehavior="extend"
      snapPoints={['90%']}
      onDismiss={onDismiss}
    >
      <Box flex={1}>{children}</Box>
    </Sheet>
  );
}
