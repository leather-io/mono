import { ReactNode } from 'react';

import { Box, Sheet, SheetProps, SheetRef } from '@leather.io/ui/native';

interface SheetLayoutProps extends Omit<SheetProps, 'children' | 'ref'> {
  sheetRef: SheetRef;
  children: ReactNode;
  title: string;
}
export function SheetLayout({ children, sheetRef, title, ...sheetProps }: SheetLayoutProps) {
  return (
    <Sheet ref={sheetRef} {...sheetProps}>
      <Sheet.View gap="3">
        <Sheet.Header leftElement={<Sheet.Title>{title}</Sheet.Title>} />
        <Box px="5">{children}</Box>
      </Sheet.View>
    </Sheet>
  );
}
