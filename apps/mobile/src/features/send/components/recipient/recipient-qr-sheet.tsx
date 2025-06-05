import { ReactNode } from 'react';

import { Sheet, SheetRef } from '@leather.io/ui/native';

interface RecipientQrSheetProps {
  sheetRef: SheetRef;
  children: ReactNode;
}

export function RecipientQrSheet({ sheetRef, children }: RecipientQrSheetProps) {
  return (
    <Sheet ref={sheetRef} handleComponent={null} snapPoints={['100%']} enableDynamicSizing={false}>
      {children}
    </Sheet>
  );
}
