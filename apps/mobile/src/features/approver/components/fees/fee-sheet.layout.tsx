import { ReactNode } from 'react';

import { Sheet, SheetRef } from '@leather.io/ui/native';

interface FeeSheetLayoutProps {
  sheetRef: SheetRef;
  children: ReactNode;
}

export function FeeSheetLayout({ sheetRef, children }: FeeSheetLayoutProps) {
  return (
    <Sheet ref={sheetRef}>
      <Sheet.View pt="5" gap="3" p="3">
        {children}
      </Sheet.View>
    </Sheet>
  );
}
