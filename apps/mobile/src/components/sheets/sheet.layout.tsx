import { ReactNode, RefObject } from 'react';

import { useSettings } from '@/store/settings/settings';

import { Avatar, Box, HasChildren, Sheet, SheetHeader, SheetRef } from '@leather.io/ui/native';

interface SheetLayoutProps extends HasChildren {
  icon: ReactNode;
  sheetRef: RefObject<SheetRef>;
  title: string;
}
export function SheetLayout({ children, icon, sheetRef, title }: SheetLayoutProps) {
  const { themeDerivedFromThemePreference } = useSettings();

  return (
    <Sheet ref={sheetRef} themeVariant={themeDerivedFromThemePreference}>
      <Box gap="3" pt="4" px="5">
        <SheetHeader icon={<Avatar>{icon}</Avatar>} title={title} />
        {children}
      </Box>
    </Sheet>
  );
}
