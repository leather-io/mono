import { type ReactNode } from 'react';

import { Sheet, type SheetRef } from '@leather.io/ui/native';

interface FeeSheetLayoutProps {
  sheetRef: SheetRef;
  children: ReactNode;
  testID?: string;
}

export function FeeSheetLayout({ sheetRef, children, testID }: FeeSheetLayoutProps) {
  return (
    <Sheet ref={sheetRef}>
      <Sheet.View pt="5" gap="3" p="3" testID={testID}>
        {children}
      </Sheet.View>
    </Sheet>
  );
}
